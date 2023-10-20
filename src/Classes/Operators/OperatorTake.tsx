import Character from '../Character';
import Operator from './Operator';

class OperatorDrop extends Operator {
    execute(character: Character) {
        character.dropItem();
    }
}

export default OperatorDrop;
