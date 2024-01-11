import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export interface OperatorWriteSerialized extends OperatorSerialized {
    type: OperatorType.Write,
    writeType: WriteType,
    value: number,
    object?: OperatorWrite,
}

export enum WriteType {
    Number = 'number',
    Slot = 'slot',
}

class OperatorWrite extends Operator {
    value = 0;

    slot = 0;

    writeType: WriteType = WriteType.Number;

    execute(character: Character): number {
        if (this.writeType === WriteType.Number) {
            character.write(this.value);
        }
        if (this.writeType === WriteType.Slot) {
            character.write(character.slots[this.slot].getNumberValue());
        }
        return character.currentLine + 1;
    }

    setLine(value: number) {
        this.value = value;
    }

    serialize(withObject: boolean): OperatorWriteSerialized {
        return {
            type: OperatorType.Write,
            writeType: this.writeType,
            value: this.value,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorWriteSerialized): void {
        this.value = operator.value;
        this.writeType = operator.writeType;
    }
}

export default OperatorWrite;
