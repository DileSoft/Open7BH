import Slot from './Slot';

class NumberSlot extends Slot {
    number = 0;

    setNumber(number: number) {
        this.number = number;
    }

    getNumberValue(): number {
        return this.number;
    }
}

export default NumberSlot;
