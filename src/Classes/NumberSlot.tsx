import Slot from './Slot';
import { clampInt32 } from './Box';

class NumberSlot extends Slot {
    number = 0;

    setNumber(number: number) {
        this.number = clampInt32(number);
    }

    getNumberValue(): number | undefined {
        return this.number;
    }
}

export default NumberSlot;
