import { randomArray } from '../../Utils';
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

    constructor(level: Level) {
        super(level);
        this.directions = [Direction.Down];
    }

    setDirection(directions: Direction[]) {
        this.type = StepType.Direction;
        this.directions = directions;
    }

    execute(character: Character):number {
        if (this.type === StepType.Direction) {
            const direction = randomArray(this.directions);
            character.move(direction);
        }
        return character.currentLine + 1;
    }

    serialize(withObject: boolean):OperatorStepSerialized {
        return {
            type: OperatorType.Step,
            stepType: this.type,
            directions: this.directions,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorStep;
