import * as PIXI from 'pixi.js';
import Cell from '../Classes/Cell';
import Hole from '../Classes/Hole';
import Wall from '../Classes/Wall';
import Printer from '../Classes/Printer';
import Shredder from '../Classes/Shredder';
import { IRenderer } from './IRenderer';
import { CELL_WIDTH } from '../PixiRenderer';
import { drawHole } from './cells/drawHole';
import { drawWall } from './cells/drawWall';
import { drawPrinter } from './cells/drawPrinter';
import { drawShredder } from './cells/drawShredder';

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
        let sublabel = '';

        if (this.cell instanceof Hole) {
            drawHole(g, x, y);
        } else if (this.cell instanceof Wall) {
            drawWall(g, x, y);
        } else if (this.cell instanceof Printer) {
            drawPrinter(g, x, y, this.animationTime);
            const printer = this.cell as Printer;
            sublabel = printer.fixedValue !== undefined
                ? `${printer.fixedValue}`
                : `${printer.min}..${printer.max}`;
        } else if (this.cell instanceof Shredder) {
            drawShredder(g, x, y, this.animationTime);
        }

        this.label.text = '';
        this.sublabel.text = sublabel;
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
