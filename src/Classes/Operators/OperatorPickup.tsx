import Character from '../Character';
import Level from '../Level';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import { Direction, DirectionWithHere } from './OperatorStep';

export interface OperatorPickupSerialized extends OperatorSerialized {
    type: OperatorType.Pickup,
    direction?: Direction | DirectionWithHere,
    object?: OperatorPickup,
}

class OperatorPickup extends Operator {
    direction?: Direction | DirectionWithHere;

    constructor(level: Level) {
        super(level);
    }

    setDirection(direction?: Direction | DirectionWithHere) {
        this.direction = direction;
    }

    execute(character: Character) {
        if (this.direction && this.direction !== DirectionWithHere.Here) {
            character.pickupFrom(this.direction as Direction);
        } else {
            character.pickupItem();
        }
        return character.currentLine + 1;
    }

    serialize(withObject: boolean): OperatorPickupSerialized {
        return {
            type: OperatorType.Pickup,
            direction: this.direction,
            object: withObject ? this : undefined,
        };
    }

    deserialize(serialized: OperatorPickupSerialized): void {
        this.direction = serialized.direction;
    }
}

export default OperatorPickup;
