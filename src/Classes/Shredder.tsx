import Cell, { CellType } from './Cell';

class Shredder extends Cell {
    isEmpty = true;

    shredded: 0;

    getType(): CellType {
        return CellType.Shredder;
    }

    shred(): void {
        this.shredded++;
    }
}

export default Shredder;
