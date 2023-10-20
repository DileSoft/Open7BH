import Character from '../Character';
import Operator from './Operator';

class OperatorPickup extends Operator {
    execute(character: Character) {
        character.pickupItem();
    }
}

export default OperatorPickup;
