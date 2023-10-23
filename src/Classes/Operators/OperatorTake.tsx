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

    constructor(level: Level) {
        super(level);
        this.direction = Direction.Down;
    }

    setDirection(direction: Direction) {
        this.direction = direction;
    }

    execute(character: Character):number {
        character.take(this.direction);
        return character.currentLine + 1;
    }

    serialize(withObject: boolean):OperatorTakeSerialized {
        return {
            type: OperatorType.Take,
            direction: this.direction,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorTakeSerialized): void {
        this.direction = operator.direction;
    }
}

export default OperatorTake;
