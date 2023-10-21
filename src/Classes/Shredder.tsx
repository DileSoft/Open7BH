import Cell, { CellType } from './Cell';

class Shredder extends Cell {
    isEmpty = true;

    getType(): CellType {
        return CellType.Shredder;
    }
}

export default Shredder;
