import Cell, { CellType } from './Cell';

class Empty extends Cell {
    isEmpty = true;

    getType(): CellType {
        return CellType.Empty;
    }
}

export default Empty;
