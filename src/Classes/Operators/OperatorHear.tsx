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
        return character.currentLine + 1;
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
}

export default OperatorHear;
