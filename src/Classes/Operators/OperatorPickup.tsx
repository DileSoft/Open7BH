import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export interface OperatorPickupSerialized extends OperatorSerialized {
    type: OperatorType.Pickup,
    object?: OperatorPickup,
}

class OperatorPickup extends Operator {
    execute(character: Character) {
        character.pickupItem();
        return character.currentLine + 1;
    }

    serialize(withObject: boolean): OperatorPickupSerialized {
        return {
            type: OperatorType.Pickup,
            object: withObject ? this : undefined,
        };
    }

    deserialize(serialized: OperatorSerialized): void {
        
    }
}

export default OperatorPickup;
