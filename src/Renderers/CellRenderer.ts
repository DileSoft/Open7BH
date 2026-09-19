import * as PIXI from 'pixi.js';
import Cell from '../Classes/Cell';
import Hole from '../Classes/Hole';
import Wall from '../Classes/Wall';
import Printer from '../Classes/Printer';
import Shredder from '../Classes/Shredder';
import { IRenderer } from './IRenderer';
import { CELL_WIDTH } from '../PixiRenderer';

export class CellRenderer implements IRenderer {
    public container: PIXI.Container;
    private graphics: PIXI.Graphics;
    private label: PIXI.Text;
    private sublabel: PIXI.Text;
    private cell: Cell;
    private animationTime = 0;

    constructor(cell: Cell, parent: PIXI.Container) {
        this.cell = cell;
        this.container = new PIXI.Container();
        this.graphics = new PIXI.Graphics();
        this.container.addChild(this.graphics);
        this.label = new PIXI.Text({ text: '', style: { fontSize: 11, fill: 0x000000, fontWeight: 'bold' } });
        this.label.anchor.set(0.5);
        this.label.position.set((cell.x * CELL_WIDTH + CELL_WIDTH / 2), (cell.y * CELL_WIDTH + CELL_WIDTH / 2) - 8);
        this.container.addChild(this.label);
        this.sublabel = new PIXI.Text({ text: '', style: { fontSize: 9, fill: 0x333333 } });
        this.sublabel.anchor.set(0.5);
        this.sublabel.position.set((cell.x * CELL_WIDTH + CELL_WIDTH / 2), (cell.y * CELL_WIDTH + CELL_WIDTH / 2) + 10);
        this.container.addChild(this.sublabel);
        parent.addChild(this.container);
        this.update(0);
    }

    update(animationSpeed: number) {
        this.animationTime += animationSpeed;
        const g = this.graphics;
        g.clear();
        const x = this.cell.x * CELL_WIDTH;
        const y = this.cell.y * CELL_WIDTH;
        let fillColor = 0xffffff;
        let label = '';
        let sublabel = '';
        if (this.cell instanceof Hole) {
            fillColor = 0x111111;
            label = '';
        } else if (this.cell instanceof Wall) {
            fillColor = 0x888888;
            label = 'WALL';
        } else if (this.cell instanceof Printer) {
            const pulse = 0.5 + Math.sin(this.animationTime * 4) * 0.5;
            fillColor = 0x00cc44;
            label = 'PRINT';
            const printer = this.cell as Printer;
            sublabel = printer.fixedValue !== undefined
                ? `${printer.fixedValue}`
                : `${printer.min}..${printer.max}`;
            // Pulsing inner glow
            g.rect(x + 6, y + 6, CELL_WIDTH - 12, CELL_WIDTH - 12);
            g.fill({ color: 0x00ff66, alpha: 0.35 + pulse * 0.3 });
        } else if (this.cell instanceof Shredder) {
            fillColor = 0xcc2222;
            label = 'SHRED';
            // Teeth
            g.fill(0x7a1010);
            for (let i = 0; i < 5; i++) {
                const tx = x + 10 + i * 13;
                g.moveTo(tx, y + CELL_WIDTH - 14);
                g.lineTo(tx + 6, y + CELL_WIDTH - 26);
                g.lineTo(tx + 12, y + CELL_WIDTH - 14);
                g.fill(0x7a1010);
            }
        }

        g.rect(x, y, CELL_WIDTH, CELL_WIDTH);
        g.fill(fillColor);
        g.stroke({ width: 1, color: 0x000000 });

        if (this.cell instanceof Hole) {
            // Inner pit
            g.ellipse(x + CELL_WIDTH / 2, y + CELL_WIDTH / 2, 26, 26);
            g.fill(0x000000);
            g.ellipse(x + CELL_WIDTH / 2, y + CELL_WIDTH / 2, 18, 18);
            g.fill(0x222222);
        }

        this.label.text = label;
        this.sublabel.text = sublabel;
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
