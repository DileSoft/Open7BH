import Character from '../Character';
import Operator from './Operator';

class OperatorEnd extends Operator {
    execute(character: Character) {
        character.terminate();
    }
}

export default OperatorEnd;
