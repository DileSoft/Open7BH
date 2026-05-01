/* eslint-disable import/prefer-default-export */
import * as PIXI from 'pixi.js';
import { GameSerialized, GameState } from './Classes/Game';
import Empty from './Classes/Empty';
import Hole from './Classes/Hole';
import Printer from './Classes/Printer';
import Shredder from './Classes/Shredder';
import Wall from './Classes/Wall';
import { parseCoordinates } from './Utils';

const CELL_WIDTH = 80;
const ANIMATION_SPEED = 0.1;

export class PixiRenderer {
    private static instance: PixiRenderer | null = null;

    app: PIXI.Application | null = null;

    container: PIXI.Container | null = null;

    cellGraphics: Map<string, PIXI.Graphics> = new Map();

    characterSprites: Map<string, PIXI.Container & { targetX?: number; targetY?: number; isDead?: boolean; holeScale?: number }> = new Map();

    itemContainers: Map<string, PIXI.Container & { targetX?: number; targetY?: number }> = new Map();

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
            if (this.app.canvas !== canvas) {
                console.log('Canvas changed, re-initializing PixiRenderer');
                this.app.destroy(true, { children: true, texture: true });
                this.cellGraphics.clear();
                this.characterSprites.clear();
                this.itemContainers.clear();
                this.initialized = false;
            } else {
                return;
            }
        }

        console.log('Initializing PixiRenderer with canvas', canvas);
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

        this.app.ticker.add(() => {
            this.updateAnimations();
        });

        this.initialized = true;
    }

    private updateAnimations() {
        this.characterSprites.forEach(sprite => {
            const { targetX, targetY } = sprite;
            if (targetX !== undefined) {
                sprite.x += (targetX - sprite.x) * ANIMATION_SPEED;
                if (Math.abs(sprite.x - targetX) < 1) sprite.x = targetX;
            }
            if (targetY !== undefined) {
                sprite.y += (targetY - sprite.y) * ANIMATION_SPEED;
                if (Math.abs(sprite.y - targetY) < 1) sprite.y = targetY;
            }

            // Fall into hole animation (scale down and fade out)
            const holeScale = sprite.holeScale ?? 1;
            const isDead = sprite.isDead === true;
            if (isDead) {
                const newScale = Math.max(0, holeScale - 0.05);
                sprite.holeScale = newScale;
                sprite.scale.set(newScale);
                sprite.alpha = newScale;
                if (newScale === 0) sprite.visible = false;
            } else {
                sprite.holeScale = 1;
                sprite.scale.set(1);
            }
        });

        this.itemContainers.forEach(container => {
            const { targetX, targetY } = container;
            if (targetX !== undefined) {
                container.x += (targetX - container.x) * ANIMATION_SPEED;
                if (Math.abs(container.x - targetX) < 1) container.x = targetX;
            }
            if (targetY !== undefined) {
                container.y += (targetY - container.y) * ANIMATION_SPEED;
                if (Math.abs(container.y - targetY) < 1) container.y = targetY;
            }
        });
    }

    render(game: GameSerialized) {
        if (!game || !game.object || !this.app || !this.app.renderer || !this.container) return;

        console.log('PixiRenderer rendering...', { 
            width: game.object.level.width, 
            height: game.object.level.height,
            canvas: this.app.canvas.isConnected
        });

        const level = game.object.level;
        if (!level) return;
        const cells = level.cells;

        this.app.renderer.resize(
            level.width * CELL_WIDTH + 1,
            level.height * CELL_WIDTH + 1,
        );

        // Simple static render for now
        const cellCoordinates = Object.keys(cells);
        
        // Remove old graphics if they are no longer in the level
        this.cellGraphics.forEach((graphics, coord) => {
            if (!cells[coord]) {
                graphics.destroy();
                this.cellGraphics.delete(coord);
            }
        });

        cellCoordinates.forEach(cellCoordinate => {
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
        });

        // Clean up items that are no longer in cells
        const currentItemKeys = new Set(Object.keys(cells).map(coord => `cell_${coord}`));
        this.itemContainers.forEach((container, key) => {
            if (!currentItemKeys.has(key)) {
                container.destroy({ children: true });
                this.itemContainers.delete(key);
            }
        });

        Object.keys(cells).forEach(cellCoordinate => {
            const coordinates = parseCoordinates(cellCoordinate);
            const cell = cells[cellCoordinate];

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

                    itemContainer.targetX = coordinates[0] * CELL_WIDTH + CELL_WIDTH / 2;
                    itemContainer.targetY = coordinates[1] * CELL_WIDTH + CELL_WIDTH / 2;

                    if (itemContainer.x === 0 && itemContainer.y === 0) {
                        itemContainer.x = itemContainer.targetX;
                        itemContainer.y = itemContainer.targetY;
                    }

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
        
        // Remove characters that are no longer in the level
        const currentCharacterNames = new Set(characters.map(c => c.name));
        this.characterSprites.forEach((sprite, name) => {
            if (!currentCharacterNames.has(name)) {
                sprite.destroy({ children: true });
                this.characterSprites.delete(name);
            }
        });

        characters.forEach(character => {
            let charContainer = this.characterSprites.get(character.name);
            if (!charContainer) {
                charContainer = new PIXI.Container();

                const charGraphics = new PIXI.Graphics();
                // Голова
                charGraphics.circle(0, -15, 12); 
                charGraphics.fill(0xffc0cb); // Розовый (Pink)
                
                // Глаза
                charGraphics.circle(-4, -17, 1.5);
                charGraphics.circle(4, -17, 1.5);
                charGraphics.fill(0x000000);

                // Тело
                charGraphics.roundRect(-8, -3, 16, 22, 4); 
                charGraphics.fill(0x808080); // Серый (Gray)

                // Руки
                charGraphics.moveTo(-8, 2);
                charGraphics.lineTo(-14, 12);
                charGraphics.moveTo(8, 2);
                charGraphics.lineTo(14, 12);

                // Ноги
                charGraphics.moveTo(-4, 19);
                charGraphics.lineTo(-6, 28);
                charGraphics.moveTo(4, 19);
                charGraphics.lineTo(6, 28);

                charGraphics.stroke({ 
                    width: 2, 
                    color: PixiRenderer.colorToHex(character.color) 
                });

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

            charContainer.targetX = character.cell.x * CELL_WIDTH + CELL_WIDTH / 2;
            charContainer.targetY = character.cell.y * CELL_WIDTH + CELL_WIDTH / 2;
            
            if (character.isDead && !charContainer.isDead) {
                console.log(`Character ${character.name} died!`);
            }
            charContainer.isDead = character.isDead;

            const charGraphics = charContainer.getChildAt(0) as PIXI.Graphics;
            charGraphics.clear();
            
            const mainColor = character.isDead ? 0xff0000 : PixiRenderer.colorToHex(character.color);

            // Голова
            charGraphics.circle(0, -15, 12); 
            charGraphics.fill(0xffc0cb); // Розовый (Pink)

            // Глаза
            charGraphics.circle(-4, -17, 1.5);
            charGraphics.circle(4, -17, 1.5);
            charGraphics.fill(0x000000);

            // Тело
            charGraphics.roundRect(-8, -3, 16, 22, 4); 
            charGraphics.fill(0x808080); // Серый (Gray)

            // Руки
            charGraphics.moveTo(-8, 2);
            charGraphics.lineTo(-14, 12);
            charGraphics.moveTo(8, 2);
            charGraphics.lineTo(14, 12);

            // Ноги
            charGraphics.moveTo(-4, 19);
            charGraphics.lineTo(-6, 28);
            charGraphics.moveTo(4, 19);
            charGraphics.lineTo(6, 28);

            charGraphics.stroke({
                width: 2,
                color: mainColor,
            });

            if (charContainer.x === 0 && charContainer.y === 0) {
                charContainer.x = charContainer.targetX;
                charContainer.y = charContainer.targetY;
            }

            charContainer.alpha = character.isDead ? 0.5 : 1;
            charContainer.visible = !character.isTerminated || character.isDead;

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
}
