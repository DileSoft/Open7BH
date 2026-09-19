import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export interface OperatorHearSerialized extends OperatorSerialized {
    type: OperatorType.Hear,
    hear?: string,
    object?: OperatorHear,
}

class OperatorHear extends Operator {
    hear?: string;

    execute(character: Character): number {
        character.hear = this.hear;
        // Stay on the hear line while waiting; say will advance past it on wake.
        return character.currentLine;
    }

    setHear(value: string) {
        this.hear = value;
    }

    serialize(withObject: boolean): OperatorHearSerialized {
        return {
            type: OperatorType.Hear,
            hear: this.hear,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorHearSerialized): void {
        this.hear = operator.hear;
    }
}

export default OperatorHear;
