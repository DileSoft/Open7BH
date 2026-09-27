import Character from '../Character';
import Level from '../Level';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import { Direction } from './OperatorStep';

export interface OperatorGiveSerialized extends OperatorSerialized {
    type: OperatorType.Give;
    direction: Direction;
    slot?: number;
    object?: OperatorGive;
}

class OperatorGive extends Operator {
    direction: Direction;

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
            // Stay on this command until the recipient is reached and given the cube.
            const finished = character.giveToSlot(this.slot);
            return finished ? character.currentLine + 1 : character.currentLine;
        }
        character.giveItem(this.direction);
        return character.currentLine + 1;
    }

    serialize(withObject: boolean):OperatorGiveSerialized {
        return {
            type: OperatorType.Give,
            direction: this.direction,
            slot: this.slot,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorGiveSerialized): void {
        this.direction = operator.direction;
        this.slot = operator.slot;
    }
}

export default OperatorGive;
