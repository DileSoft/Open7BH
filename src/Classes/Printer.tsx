import Cell, { CellType } from './Cell';
import Level from './Level';

class Printer extends Cell {
    isEmpty = true;

    min = 0;

    max = 99;

    constructor(level: Level, x: number, y: number, min?: number, max?: number) {
        super(level, x, y);
        this.min = min || 0;
        this.max = max || 99;
    }

    print() {
        return Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
    }

    getType(): CellType {
        return CellType.Printer;
    }
}

export default Printer;
