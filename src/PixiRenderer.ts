import * as PIXI from 'pixi.js';
import Character from './Classes/Character';
import Cell from './Classes/Cell';
import { CellRenderer } from './Renderers/CellRenderer';
import { CharacterRenderer } from './Renderers/CharacterRenderer';
import { ItemRenderer } from './Renderers/ItemRenderer';

const BASE_ANIMATION_SPEED = 0.1;
export const CELL_WIDTH = 80;

export class PixiRenderer {
    private static instance: PixiRenderer | null = null;

    private currentAnimationSpeed = BASE_ANIMATION_SPEED;

    app: PIXI.Application | null = null;
    container: PIXI.Container | null = null;
    cellsLayer: PIXI.Container | null = null;
    itemsLayer: PIXI.Container | null = null;
    charactersLayer: PIXI.Container | null = null;

    cellRenderers: Map<Cell, CellRenderer> = new Map();
    characterRenderers: Map<Character, CharacterRenderer> = new Map();
    itemRenderers: Map<Cell, ItemRenderer> = new Map();

    private initialized = false;

    private constructor() {
        Cell.renderer = this;
    }

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
                this.clearState();
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

        this.cellsLayer = new PIXI.Container();
        this.charactersLayer = new PIXI.Container();
        this.itemsLayer = new PIXI.Container();
        this.container.addChild(this.cellsLayer);
        this.container.addChild(this.charactersLayer);
        this.container.addChild(this.itemsLayer);

        this.app.ticker.add(() => {
            this.updateAnimations();
        });

        this.initialized = true;
    }

    private clearState() {
        this.cellRenderers.forEach(r => r.destroy());
        this.cellRenderers.clear();
        this.characterRenderers.forEach(r => r.destroy());
        this.characterRenderers.clear();
        this.itemRenderers.forEach(r => r.destroy());
        this.itemRenderers.clear();
    }

    public clearScene() {
        this.clearState();
    }

    public registerCell(cell: Cell) {
        if (!this.cellsLayer || !this.itemsLayer) return;
        
        if (!this.cellRenderers.has(cell)) {
            this.cellRenderers.set(cell, new CellRenderer(cell, this.cellsLayer));
        }
        
        if (!this.itemRenderers.has(cell)) {
            this.itemRenderers.set(cell, new ItemRenderer(cell, this.itemsLayer));
        }

        this.updateItem(cell);
    }

    public updateItem(cell: Cell) {
        const renderer = this.itemRenderers.get(cell);
        if (renderer) {
            renderer.update(this.currentAnimationSpeed);
        }
    }

    public registerCharacter(character: Character) {
        if (!this.charactersLayer) return;

        if (!this.characterRenderers.has(character)) {
            this.characterRenderers.set(character, new CharacterRenderer(character, this.charactersLayer));
        }
    }

    public updateCharacter(character: Character) {
        const renderer = this.characterRenderers.get(character);
        if (renderer) {
            renderer.update(this.currentAnimationSpeed);
        }
    }

    public update(game: any) {
        // game.speed is the interval in ms.
        // If game.speed = 1000 (1 step/sec), we want multiplier 1.
        // If game.speed = 100 (10 steps/sec), we want multiplier 10.
        const speedMultiplier = 1000 / (game.speed || 1000);
        this.currentAnimationSpeed = BASE_ANIMATION_SPEED * speedMultiplier;

        this.cellRenderers.forEach(r => r.update(this.currentAnimationSpeed));
        this.itemRenderers.forEach(r => r.update(this.currentAnimationSpeed));
        this.characterRenderers.forEach(r => r.update(this.currentAnimationSpeed));
    }

    private updateAnimations() {
        this.characterRenderers.forEach(renderer => {
            renderer.update(this.currentAnimationSpeed);
        });

        this.itemRenderers.forEach(renderer => {
            renderer.update(this.currentAnimationSpeed);
        });
    }

    public resize(width: number, height: number) {
        if (!this.app) return;
        this.app.renderer.resize(
            width * CELL_WIDTH + 1,
            height * CELL_WIDTH + 1,
        );
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
