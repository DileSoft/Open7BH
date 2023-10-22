import { randomArray } from '../../Utils';
import CellSlot from '../CellSlot';
import Character from '../Character';
import Level from '../Level';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export enum Direction {
    Up = 'Up',
    Down = 'Down',
    Left = 'Left',
    Right = 'Right',
    UpLeft = 'UpLeft',
    UpRight = 'UpRight',
    DownLeft = 'DownLeft',
    DownRight = 'DownRight',
}

export enum StepType {
    Direction = 'Direction',
    Slot = 'Slot',
    Near = 'Near',
}

export interface OperatorStepSerialized extends OperatorSerialized {
    stepType: StepType;
    directions?: Direction[];
    slot?: number;
    object?: OperatorStep;
}

class OperatorStep extends Operator {
    type = StepType.Direction;

    directions: Direction[];

    slot: number;

    constructor(level: Level) {
        super(level);
        this.directions = [Direction.Down];
    }

    setDirection(directions: Direction[]) {
        this.type = StepType.Direction;
        this.directions = directions;
    }

    setSlot(slot: number) {
        this.type = StepType.Slot;
        this.slot = slot;
    }

    prepare(character: Character) {
        if (this.type === StepType.Direction) {
            const direction = randomArray(this.directions);
            character.prepareMove(direction);
        }
        if (this.type === StepType.Slot && character.slots[this.slot].getCellValue()) {
            const path = this.level.findNear(
                [character.cell.x, character.cell.y],
                cell => cell === character.slots[this.slot].getCellValue(),
            );
            console.log(character.slots[this.slot].getCellValue());
            console.log(path);
            if (path.length > 1 && path[1]) {
                character.nextMove = path[1];
            }
        }
    }

    execute(character: Character):number {
        if (this.type === StepType.Slot && character.nextMove) {
            return character.currentLine;
        }
        return character.currentLine + 1;
    }

    serialize(withObject: boolean):OperatorStepSerialized {
        return {
            type: OperatorType.Step,
            stepType: this.type,
            directions: this.directions,
            slot: this.slot,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorStep;
