import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import { Direction } from './OperatorStep';

export interface OperatorSaySerialized extends OperatorSerialized {
    type: OperatorType.Say,
    hear?: string,
    direction: Direction,
    object?: OperatorSay,
}

class OperatorSay extends Operator {
    hear?: string;

    direction: Direction;

    execute(character: Character): number {
        character.say(this.hear, this.direction);
        return character.currentLine + 1;
    }

    setSay(value: string) {
        this.hear = value;
    }

    setDirection(direction: Direction) {
        this.direction = direction;
    }

    serialize(withObject: boolean): OperatorSaySerialized {
        return {
            type: OperatorType.Say,
            hear: this.hear,
            direction: this.direction,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorSaySerialized): void {
        this.hear = operator.hear;
        this.direction = operator.direction;
    }
}

export default OperatorSay;
