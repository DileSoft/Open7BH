import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export interface OperatorEndSerialized extends OperatorSerialized {
    type: OperatorType.End,
    object?: OperatorEnd,
}

class OperatorEnd extends Operator {
    execute(character: Character): number {
        character.terminate();
        return character.currentLine;
    }

    serialize(withObject: boolean): OperatorEndSerialized {
        return {
            type: OperatorType.End,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorEnd;
