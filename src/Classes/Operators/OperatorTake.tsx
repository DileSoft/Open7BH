import Character from '../Character';
import Level from '../Level';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import { Direction } from './OperatorStep';

export interface OperatorTakeSerialized extends OperatorSerialized {
    type: OperatorType.Take;
    direction: Direction;
    slot?: number;
    object?: OperatorTake;
}

class OperatorTake extends Operator {
    direction: Direction;

    /** When set, walk to the worker/printer referenced by this memory slot and take from it. */
    slot?: number;

    constructor(level: Level) {
        super(level);
        this.direction = Direction.Down;
    }

    setDirection(direction: Direction) {
        this.direction = direction;
        this.slot = undefined;
    }

    setSlot(slot: number) {
        this.slot = slot;
    }

    execute(character: Character):number {
        if (this.slot !== undefined) {
            character.takeFromSlot(this.slot);
        } else {
            character.take(this.direction);
        }
        return character.currentLine + 1;
    }

    serialize(withObject: boolean):OperatorTakeSerialized {
        return {
            type: OperatorType.Take,
            direction: this.direction,
            slot: this.slot,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorTakeSerialized): void {
        this.direction = operator.direction;
        this.slot = operator.slot;
    }
}

export default OperatorTake;
