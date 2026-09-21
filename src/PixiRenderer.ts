import * as PIXI from 'pixi.js';
import Character from './Classes/Character';
import Cell from './Classes/Cell';
import type Level from './Classes/Level';
import type { GameSerialized, LevelTranslations } from './Classes/Game';
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

    gridLayer: PIXI.Graphics | null = null;

    itemsLayer: PIXI.Container | null = null;

    charactersLayer: PIXI.Container | null = null;

    cellRenderers: Map<Cell, CellRenderer> = new Map();

    characterRenderers: Map<Character, CharacterRenderer> = new Map();

    itemRenderers: Map<Cell, ItemRenderer> = new Map();

    private initialized = false;

    public translations: LevelTranslations | undefined;

    public levelName: string | undefined;

    // Guard against concurrent init() calls (e.g. React StrictMode double-mount).
    // If an init is already in progress, reuse the same promise so we never create
    // a second PIXI.Application on the same canvas (which would orphan the
    // registered renderers and leave the canvas blank).
    private initPromise: Promise<void> | null = null;

    private levelWidth = 0;

    private levelHeight = 0;

    private cellClickHandler: ((x: number, y: number) => void) | null = null;

    private constructor() {
        Cell.renderer = this;
    }

    public static getInstance(): PixiRenderer {
        if (!PixiRenderer.instance) {
            PixiRenderer.instance = new PixiRenderer();
        }
        return PixiRenderer.instance;
    }

    async init(canvas: HTMLCanvasElement): Promise<void> {
        if (this.initialized && this.app) {
            if (this.app.canvas !== canvas) {
                this.app.destroy(true, { children: true, texture: true });
                this.clearState();
                this.releaseLayers();
                this.initialized = false;
            } else {
                return;
            }
        }

        // If init is already in progress, reuse the same promise instead of
        // creating a second PIXI.Application on the same canvas.
        if (this.initPromise) {
            await this.initPromise;
            return;
        }

        this.initPromise = this.doInit(canvas);
        try {
            await this.initPromise;
        } finally {
            this.initPromise = null;
        }
    }

    private async doInit(canvas: HTMLCanvasElement): Promise<void> {
        this.app = new PIXI.Application();
        try {
            await this.app.init({
                canvas,
                width: 800,
                height: 600,
                backgroundColor: 0xcccccc,
                antialias: true,
            });
        } catch (e) {
            console.error('PIXI.Application.init() failed:', e);
            throw e;
        }

        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);

        this.cellsLayer = new PIXI.Container();
        this.gridLayer = new PIXI.Graphics();
        this.charactersLayer = new PIXI.Container();
        this.itemsLayer = new PIXI.Container();
        this.container.addChild(this.gridLayer);
        this.container.addChild(this.cellsLayer);
        this.container.addChild(this.charactersLayer);
        this.container.addChild(this.itemsLayer);

        this.app.ticker.add(() => {
            this.updateAnimations();
        });

        this.app.canvas.addEventListener('pointerdown', this.onCanvasPointerDown);

        this.initialized = true;
    }

    private onCanvasPointerDown = (event: PointerEvent) => {
        if (!this.cellClickHandler || !this.app) return;
        const rect = this.app.canvas.getBoundingClientRect();
        const scaleX = this.app.canvas.width / rect.width;
        const scaleY = this.app.canvas.height / rect.height;
        const x = Math.floor(((event.clientX - rect.left) * scaleX) / CELL_WIDTH);
        const y = Math.floor(((event.clientY - rect.top) * scaleY) / CELL_WIDTH);
        if (x >= 0 && y >= 0 && x < this.levelWidth && y < this.levelHeight) {
            this.cellClickHandler(x, y);
        }
    };

    private clearState() {
        this.cellRenderers.forEach(r => r.destroy());
        this.cellRenderers.clear();
        this.characterRenderers.forEach(r => r.destroy());
        this.characterRenderers.clear();
        this.itemRenderers.forEach(r => r.destroy());
        this.itemRenderers.clear();
    }

    /**
     * Drop references to the current (destroyed) containers. Called only when
     * the app is being recreated on a different canvas, so that any renderer
     * call that happens while the new app is initializing becomes a no-op
     * instead of registering cells onto the dead layers.
     */
    private releaseLayers() {
        this.container = null;
        this.cellsLayer = null;
        this.gridLayer = null;
        this.charactersLayer = null;
        this.itemsLayer = null;
        this.levelWidth = 0;
        this.levelHeight = 0;
    }

    public clearScene() {
        this.clearState();
    }

    public registerCell(cell: Cell) {
        if (!this.cellsLayer || !this.itemsLayer) {
            return;
        }

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
        if (!this.charactersLayer) {
            return;
        }

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

    public update(game: GameSerialized) {
        // game.speed is the interval in ms.
        // If game.speed = 1000 (1 step/sec), we want multiplier 1.
        // If game.speed = 100 (10 steps/sec), we want multiplier 10.
        const speedMultiplier = 1000 / (game.speed || 1000);
        this.currentAnimationSpeed = BASE_ANIMATION_SPEED * speedMultiplier;
        this.translations = game.translations;
        this.levelName = game.name;

        // Only reconcile renderers once the current app is fully initialized —
        // otherwise cells could be registered onto layers of a destroyed app.
        if (this.initialized && game.object?.level) {
            this.syncLevel(game.object.level);
        }

        this.cellRenderers.forEach(r => r.update(this.currentAnimationSpeed));
        this.itemRenderers.forEach(r => r.update(this.currentAnimationSpeed));
        this.characterRenderers.forEach(r => r.update(this.currentAnimationSpeed));
    }

    /**
     * Reconcile registered renderers with the current level state. Cells that
     * were replaced/removed (e.g. edited in the editor) lose their renderers,
     * and newly created cells/characters get registered.
     */
    public syncLevel(level: Level) {
        const cells = Object.values(level.cells);
        const cellSet = new Set(cells);
        this.cellRenderers.forEach((renderer, cell) => {
            if (!cellSet.has(cell)) {
                renderer.destroy();
                this.cellRenderers.delete(cell);
            }
        });
        this.itemRenderers.forEach((renderer, cell) => {
            if (!cellSet.has(cell)) {
                renderer.destroy();
                this.itemRenderers.delete(cell);
            }
        });
        const characters = level.getCharacters();
        const characterSet = new Set(characters);
        this.characterRenderers.forEach((renderer, character) => {
            if (!characterSet.has(character)) {
                renderer.destroy();
                this.characterRenderers.delete(character);
            }
        });
        cells.forEach(cell => this.registerCell(cell));
        characters.forEach(character => this.registerCharacter(character));
    }

    public setCellClickHandler(handler: ((x: number, y: number) => void) | null) {
        this.cellClickHandler = handler;
    }

    private updateAnimations() {
        this.cellRenderers.forEach(renderer => {
            renderer.update(this.currentAnimationSpeed);
        });

        this.characterRenderers.forEach(renderer => {
            renderer.update(this.currentAnimationSpeed);
        });

        this.itemRenderers.forEach(renderer => {
            renderer.update(this.currentAnimationSpeed);
        });
    }

    public resize(width: number, height: number) {
        if (!this.app || !this.app.renderer) {
            return;
        }
        this.levelWidth = width;
        this.levelHeight = height;
        this.app.renderer.resize(
            width * CELL_WIDTH + 1,
            height * CELL_WIDTH + 1,
        );
        this.drawGrid(width, height);
    }

    private drawGrid(width: number, height: number) {
        if (!this.gridLayer) return;
        const g = this.gridLayer;
        g.clear();
        // Vertical lines
        for (let x = 0; x <= width; x++) {
            g.moveTo(x * CELL_WIDTH, 0);
            g.lineTo(x * CELL_WIDTH, height * CELL_WIDTH);
        }
        // Horizontal lines
        for (let y = 0; y <= height; y++) {
            g.moveTo(0, y * CELL_WIDTH);
            g.lineTo(width * CELL_WIDTH, y * CELL_WIDTH);
        }
        g.stroke({ width: 1, color: 0x666666, alpha: 0.7 });
    }

    public static colorToHex(color: string): number {
        if (!color) return 0x0000ff;
        if (color.startsWith('#')) return parseInt(color.slice(1), 16);
        const colors: Record<string, number> = {
            red: 0xff0000,
            blue: 0x0000ff,
            green: 0x00cc44,
            yellow: 0xffcc00,
            orange: 0xff8800,
            purple: 0x9900cc,
            gray: 0x888888,
            grey: 0x888888,
            black: 0x222222,
            white: 0xffffff,
            pink: 0xffc0cb,
            cyan: 0x00cccc,
            brown: 0x8b4513,
        };
        return colors[color.toLowerCase()] ?? 0x0000ff;
    }
}
