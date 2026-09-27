import Character from '../Character';
import Level from '../Level';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import { Direction } from './OperatorStep';

export interface OperatorSaySerialized extends OperatorSerialized {
    type: OperatorType.Say,
    hear?: string,
    direction: Direction | 'all',
    slot?: number,
    object?: OperatorSay,
}

class OperatorSay extends Operator {
    hear?: string;

    direction: Direction | 'all' = Direction.Down;

    /** When set, the message is told to the worker referenced by this memory slot. */
    slot?: number;

    constructor(level: Level) {
        super(level);
        this.direction = Direction.Down;
    }

    execute(character: Character): number {
        if (this.slot !== undefined) {
            character.sayToSlot(this.slot, this.hear);
        } else {
            character.say(this.hear, this.direction);
        }
        return character.currentLine + 1;
    }

    setSay(value: string) {
        this.hear = value;
    }

    setDirection(direction: Direction | 'all') {
        this.direction = direction;
        this.slot = undefined;
    }

    setSlot(slot: number) {
        this.slot = slot;
    }

    serialize(withObject: boolean): OperatorSaySerialized {
        return {
            type: OperatorType.Say,
            hear: this.hear,
            direction: this.direction,
            slot: this.slot,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorSaySerialized): void {
        this.hear = operator.hear;
        this.direction = operator.direction ?? Direction.Down;
        this.slot = operator.slot;
    }
}

export default OperatorSay;
