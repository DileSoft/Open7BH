import Box, { clampInt32 } from './Box';
import Cell, { CellType } from './Cell';
import Level from './Level';

class Printer extends Cell {
    isEmpty = true;

    min = 0;

    max = 99;

    fixedValue?: number;

    constructor(level: Level, x: number, y: number, min?: number, max?: number, fixedValue?: number) {
        super(level, x, y);
        this.min = min ?? 0;
        this.max = max ?? 99;
        this.fixedValue = fixedValue;
    }

    print() {
        if (this.fixedValue !== undefined) return clampInt32(this.fixedValue);
        const low = Math.min(this.min, this.max);
        const high = Math.max(this.min, this.max);
        return clampInt32(Math.floor(Math.random() * (high - low + 1)) + low);
    }

    printBox(tag?: string) {
        const box = new Box(this.print());
        if (tag) box.setTag(tag);
        return box;
    }

    getType(): CellType {
        return CellType.Printer;
    }
}

export default Printer;
