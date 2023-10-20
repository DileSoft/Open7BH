import Character from '../Character';
import Operator, { OperatorType } from './Operator';

class OperatorDrop extends Operator {
    execute(character: Character) {
        character.dropItem();
    }

    serialize() {
        return {
            type: OperatorType.Drop,
        };
    }
}

export default OperatorDrop;
