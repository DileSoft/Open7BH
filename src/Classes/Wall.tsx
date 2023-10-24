import Cell, { CellType } from './Cell';

class Wall extends Cell {
    isEmpty = true;

    getType(): CellType {
        return CellType.Wall;
    }
}

export default Wall;
