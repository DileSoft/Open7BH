import Cell, { CellType } from './Cell';

class Hole extends Cell {
    isEmpty = true;

    getType(): CellType {
        return CellType.Hole;
    }
}

export default Hole;
