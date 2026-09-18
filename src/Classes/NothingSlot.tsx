import Slot from './Slot';

class NothingSlot extends Slot {
    isNothing(): boolean {
        return true;
    }

    getNumberValue(): number | undefined {
        return undefined;
    }
}

export default NothingSlot;
