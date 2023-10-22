import Cell from './Cell';
import Slot from './Slot';

class CellSlot extends Slot {
    cellValue?: Cell;

    setCell(cell: Cell) {
        this.cellValue = cell;
    }

    getCellValue(): Cell | undefined {
        return this.cellValue;
    }
}

export default CellSlot;
