import Slot from './Slot';
import Box from './Box';

/**
 * Reference to a specific physical data cube (by identity).
 * Follows the box if it moves; becomes nothing if the box is destroyed.
 */
class BoxSlot extends Slot {
    box?: Box;

    setBox(box?: Box) {
        this.box = box;
    }

    isNothing(): boolean {
        return !this.box || this.box.destroyed;
    }

    getBox(): Box | undefined {
        if (!this.box || this.box.destroyed) return undefined;
        return this.box;
    }

    getNumberValue(): number | undefined {
        if (!this.box || this.box.destroyed) return undefined;
        return this.box.value;
    }

    getCellValue() {
        return undefined;
    }
}

export default BoxSlot;
