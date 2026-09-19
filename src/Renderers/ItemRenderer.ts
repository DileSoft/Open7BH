import * as PIXI from 'pixi.js';
import Cell from '../Classes/Cell';
import { IRenderer } from './IRenderer';
import { CELL_WIDTH } from '../PixiRenderer';

export class ItemRenderer implements IRenderer {
    public container: PIXI.Container;
    private cell: Cell;
    private boxGraphics: PIXI.Graphics;
    private text: PIXI.Text;
    private lastValue = '';
    private popScale = 1;
    private flash = 0;

    public targetX: number = 0;
    public targetY: number = 0;

    constructor(cell: Cell, parent: PIXI.Container) {
        this.cell = cell;
        this.container = new PIXI.Container();

        this.boxGraphics = new PIXI.Graphics();
        this.boxGraphics.rect(-10, -10, 20, 20);
        this.boxGraphics.fill(0xdeb887);
        this.boxGraphics.stroke({ width: 1, color: 0x000000 });
        this.container.addChild(this.boxGraphics);

        this.text = new PIXI.Text({ text: '', style: { fontSize: 10, fill: 0x000000, fontWeight: 'bold' } });
        this.text.anchor.set(0.5);
        this.container.addChild(this.text);

        parent.addChild(this.container);
        this.update(0);
    }

    update(animationSpeed: number) {
        const item = this.cell.getItem();
        if (item && !item.destroyed) {
            this.container.visible = true;
            const label = item.isRandom ? '?' : item.value.toString();
            if (label !== this.lastValue) {
                // Pop on appear / value change (e.g. write)
                this.lastValue = label;
                this.popScale = 0.3;
                this.flash = 1;
            }
            this.text.text = label;
            if (item.tag) {
                this.text.text += `\n${item.tag}`;
            }
            this.targetX = this.cell.x * CELL_WIDTH + CELL_WIDTH / 2;
            this.targetY = this.cell.y * CELL_WIDTH + CELL_WIDTH - 15;

            if (this.container.x === 0 && this.container.y === 0) {
                this.container.x = this.targetX;
                this.container.y = this.targetY;
            }

            // Smooth movement
            this.container.x += (this.targetX - this.container.x) * animationSpeed;
            this.container.y += (this.targetY - this.container.y) * animationSpeed;

            // Pop scale + write flash
            if (this.popScale < 1) {
                this.popScale = Math.min(1, this.popScale + Math.max(0.08, animationSpeed * 0.8));
            }
            if (this.flash > 0) {
                this.flash = Math.max(0, this.flash - Math.max(0.05, animationSpeed * 0.5));
            }
            this.container.scale.set(this.popScale);
            this.boxGraphics.clear();
            this.boxGraphics.rect(-10, -10, 20, 20);
            this.boxGraphics.fill(this.flash > 0 ? 0xffe066 : 0xdeb887);
            this.boxGraphics.stroke({ width: 1, color: 0x000000 });
        } else {
            this.container.visible = false;
            this.lastValue = '';
        }
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
