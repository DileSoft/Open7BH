import * as PIXI from 'pixi.js';
import Cell from '../Classes/Cell';
import Hole from '../Classes/Hole';
import Wall from '../Classes/Wall';
import Printer from '../Classes/Printer';
import Shredder from '../Classes/Shredder';
import { IRenderer } from './IRenderer';
import { CELL_WIDTH } from '../PixiRenderer';

export class CellRenderer implements IRenderer {
    public container: PIXI.Graphics;
    private cell: Cell;

    constructor(cell: Cell, parent: PIXI.Container) {
        this.cell = cell;
        this.container = new PIXI.Graphics();
        parent.addChild(this.container);
        this.update();
    }

    update() {
        this.container.clear();
        let fillColor = 0xffffff;
        if (this.cell instanceof Hole) fillColor = 0x000000;
        else if (this.cell instanceof Wall) fillColor = 0x888888;
        else if (this.cell instanceof Printer) fillColor = 0x00ff00;
        else if (this.cell instanceof Shredder) fillColor = 0xff0000;

        this.container.rect(
            this.cell.x * CELL_WIDTH,
            this.cell.y * CELL_WIDTH,
            CELL_WIDTH,
            CELL_WIDTH,
        );
        this.container.fill(fillColor);
        this.container.stroke({ width: 1, color: 0x000000 });
    }

    destroy() {
        this.container.destroy();
    }
}
