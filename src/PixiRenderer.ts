import * as PIXI from 'pixi.js';
import { GameSerialized, GameState } from './Classes/Game';
import Empty from './Classes/Empty';
import Hole from './Classes/Hole';
import Printer from './Classes/Printer';
import Shredder from './Classes/Shredder';
import Wall from './Classes/Wall';
import { parseCoordinates } from './Utils';

const CELL_WIDTH = 80;

export class PixiRenderer {
    private static instance: PixiRenderer | null = null;

    app: PIXI.Application | null = null;

    container: PIXI.Container | null = null;

    cellGraphics: Map<string, PIXI.Graphics> = new Map();

    characterSprites: Map<string, PIXI.Container> = new Map();

    itemContainers: Map<string, PIXI.Container> = new Map();

    private initialized = false;

    private constructor() {}

    public static getInstance(): PixiRenderer {
        if (!PixiRenderer.instance) {
            PixiRenderer.instance = new PixiRenderer();
        }
        return PixiRenderer.instance;
    }

    async init(canvas: HTMLCanvasElement) {
        if (this.initialized && this.app) {
            return;
        }

        this.app = new PIXI.Application();
        await this.app.init({
            canvas,
            width: 800,
            height: 600,
            backgroundColor: 0xcccccc,
            antialias: true,
        });

        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
        this.initialized = true;
    }

    render(game: GameSerialized) {
        console.log('Rendering game with PixiRenderer');
        if (!game || !game.object || !this.app || !this.app.renderer || !this.container) return;

        const level = game.object.level;
        if (!level) return;
        const cells = level.cells;

        this.app.renderer.resize(
            level.width * CELL_WIDTH + 1,
            level.height * CELL_WIDTH + 1,
        );

        // Simple static render for now
        Object.keys(cells).forEach(cellCoordinate => {
            const coordinates = parseCoordinates(cellCoordinate);
            const cell = cells[cellCoordinate];

            let graphics = this.cellGraphics.get(cellCoordinate);
            if (!graphics) {
                graphics = new PIXI.Graphics();
                this.container?.addChild(graphics);
                this.cellGraphics.set(cellCoordinate, graphics);
            }

            graphics.clear();

            let fillColor = 0xffffff;
            if (cell instanceof Hole) fillColor = 0x000000;
            if (cell instanceof Wall) fillColor = 0x888888;
            if (cell instanceof Printer) fillColor = 0x00ff00;
            if (cell instanceof Shredder) fillColor = 0xff0000;

            graphics.rect(
                coordinates[0] * CELL_WIDTH,
                coordinates[1] * CELL_WIDTH,
                CELL_WIDTH,
                CELL_WIDTH,
            );
            graphics.fill(fillColor);
            graphics.stroke({ width: 1, color: 0x000000 });

            // Handle items in cells
            const itemKey = `cell_${cellCoordinate}`;
            if (cell instanceof Empty) {
                const item = cell.getItem();
                if (item) {
                    let itemContainer = this.itemContainers.get(itemKey);
                    if (!itemContainer) {
                        itemContainer = new PIXI.Container();

                        const box = new PIXI.Graphics();
                        box.rect(-20, -20, 40, 40);
                        box.fill(0xdeb887);
                        itemContainer.addChild(box);

                        const text = new PIXI.Text({ text: '', style: { fontSize: 14, fill: 0x000000 } });
                        text.anchor.set(0.5);
                        itemContainer.addChild(text);

                        this.container?.addChild(itemContainer);
                        this.itemContainers.set(itemKey, itemContainer);
                    }

                    itemContainer.x = coordinates[0] * CELL_WIDTH + CELL_WIDTH / 2;
                    itemContainer.y = coordinates[1] * CELL_WIDTH + CELL_WIDTH / 2;

                    const text = itemContainer.getChildAt(1) as PIXI.Text;
                    text.text = (item.isRandom && game.state !== GameState.Run) ? '?' : item.value.toString();
                    itemContainer.visible = true;
                } else {
                    const itemContainer = this.itemContainers.get(itemKey);
                    if (itemContainer) itemContainer.visible = false;
                }
            } else {
                const itemContainer = this.itemContainers.get(itemKey);
                if (itemContainer) itemContainer.visible = false;
            }
        });

        // Render Characters
        const characters = game.object.level.getCharacters();
        characters.forEach(character => {
            let charContainer = this.characterSprites.get(character.name);
            if (!charContainer) {
                charContainer = new PIXI.Container();

                const charGraphics = new PIXI.Graphics();
                charGraphics.circle(0, -10, 15); // Head
                charGraphics.rect(-5, 5, 10, 20); // Body
                charGraphics.fill(0xffffff);
                charGraphics.stroke({ width: 2, color: PixiRenderer.colorToHex(character.color) });

                charContainer.addChild(charGraphics);

                const itemGraphic = new PIXI.Graphics();
                itemGraphic.rect(-15, -15, 30, 30);
                itemGraphic.fill(0xdeb887);
                itemGraphic.visible = false;
                charContainer.addChild(itemGraphic);

                const itemText = new PIXI.Text({ text: '', style: { fontSize: 12, fill: 0x000000 } });
                itemText.anchor.set(0.5);
                itemText.visible = false;
                charContainer.addChild(itemText);

                this.container?.addChild(charContainer);
                this.characterSprites.set(character.name, charContainer);
            }

            charContainer.x = character.cell.x * CELL_WIDTH + CELL_WIDTH / 2;
            charContainer.y = character.cell.y * CELL_WIDTH + CELL_WIDTH / 2;
            charContainer.alpha = character.isDead ? 0.5 : 1;
            charContainer.visible = !character.isTerminated;

            const itemGraphic = charContainer.getChildAt(1) as PIXI.Graphics;
            const itemText = charContainer.getChildAt(2) as PIXI.Text;

            if (character.item) {
                itemGraphic.visible = true;
                itemText.visible = true;
                itemText.text = character.item.value.toString();
            } else {
                itemGraphic.visible = false;
                itemText.visible = false;
            }
        });
    }

    private static colorToHex(color: string): number {
        if (!color) return 0x000000;
        if (color.startsWith('#')) return parseInt(color.slice(1), 16);
        const colors: Record<string, number> = {
            red: 0xff0000,
            blue: 0x0000ff,
            green: 0x00ff00,
            yellow: 0xffff00,
            orange: 0xffa500,
            purple: 0x800080,
            gray: 0x808080,
            black: 0x000000,
            white: 0xffffff,
        };
        return colors[color.toLowerCase()] || 0x000000;
    }

    async destroy() {
        if (this.app) {
            try {
                this.app.destroy(true, { children: true, texture: true });
            } catch (e) {
                console.warn('Pixi app destroy error:', e);
            }
            this.app = null;
            this.container = null;
            this.initialized = false;
        }
    }
}
