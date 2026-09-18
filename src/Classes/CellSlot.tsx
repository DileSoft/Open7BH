import Cell from './Cell';
import Slot from './Slot';
import Box from './Box';

class CellSlot extends Slot {
    cellValue?: Cell;

    setCell(cell?: Cell) {
        this.cellValue = cell;
    }

    getCellValue(): Cell | undefined {
        return this.cellValue;
    }

    getBox(): Box | undefined {
        const item = this.cellValue?.item;
        if (!item || item.destroyed) return undefined;
        return item;
    }

    isNothing(): boolean {
        return !this.cellValue;
    }

    getNumberValue(): number | undefined {
        return this.getBox()?.value;
    }
}

export default CellSlot;
