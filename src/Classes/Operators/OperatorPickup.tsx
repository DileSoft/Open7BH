import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export interface OperatorPickupSerialized extends OperatorSerialized {
    type: OperatorType.Pickup,
    object?: OperatorPickup,
}

class OperatorPickup extends Operator {
    execute(character: Character) {
        character.pickupItem();
    }

    serialize(withObject: boolean): OperatorPickupSerialized {
        return {
            type: OperatorType.Pickup,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorPickup;
