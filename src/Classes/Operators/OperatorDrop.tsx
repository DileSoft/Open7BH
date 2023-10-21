import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export interface OperatorDropSerialized extends OperatorSerialized {
    type: OperatorType.Drop,
    object?: OperatorDrop,
}

class OperatorDrop extends Operator {
    execute(character: Character): number {
        character.dropItem();

        return character.currentLine + 1;
    }

    serialize(withObject: boolean): OperatorDropSerialized {
        return {
            type: OperatorType.Drop,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorDrop;
