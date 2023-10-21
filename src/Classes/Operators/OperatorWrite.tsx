import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export interface OperatorWriteSerialized extends OperatorSerialized {
    type: OperatorType.Write,
    value: number,
    object?: OperatorWrite,
}

class OperatorWrite extends Operator {
    value = 0;

    execute(character: Character): number {
        character.write(this.value);
        return character.currentLine + 1;
    }

    setLine(value: number) {
        this.value = value;
    }

    serialize(withObject: boolean): OperatorWriteSerialized {
        return {
            type: OperatorType.Write,
            value: this.value,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorWrite;
