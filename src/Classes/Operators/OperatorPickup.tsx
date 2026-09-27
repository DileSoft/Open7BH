import Character from '../Character';
import Level from '../Level';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import { Direction, DirectionWithHere } from './OperatorStep';

export interface OperatorPickupSerialized extends OperatorSerialized {
    type: OperatorType.Pickup,
    direction?: Direction | DirectionWithHere,
    slot?: number,
    object?: OperatorPickup,
}

class OperatorPickup extends Operator {
    direction?: Direction | DirectionWithHere;

    /** When set, walk to the object referenced by this memory slot and pick it up. */
    slot?: number;

    constructor(level: Level) {
        super(level);
    }

    setDirection(direction?: Direction | DirectionWithHere) {
        this.direction = direction;
        this.slot = undefined;
    }

    setSlot(slot: number) {
        this.slot = slot;
    }

    execute(character: Character) {
        if (this.slot !== undefined) {
            // Stay on this command until the cube is reached and picked up.
            const finished = character.pickupFromSlot(this.slot);
            return finished ? character.currentLine + 1 : character.currentLine;
        }
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
            slot: this.slot,
            object: withObject ? this : undefined,
        };
    }

    deserialize(serialized: OperatorPickupSerialized): void {
        this.direction = serialized.direction;
        this.slot = serialized.slot;
    }
}

export default OperatorPickup;
