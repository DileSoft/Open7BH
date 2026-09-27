import { randomArray } from '../../Utils';
import Character, { StepStatus } from '../Character';
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

export enum DirectionWithHere {
    Up = 'Up',
    Down = 'Down',
    Left = 'Left',
    Right = 'Right',
    UpLeft = 'UpLeft',
    UpRight = 'UpRight',
    DownLeft = 'DownLeft',
    DownRight = 'DownRight',
    Here = 'Here',
}

export enum StepType {
    Direction = 'Direction',
    Slot = 'Slot',
}

export interface OperatorStepSerialized extends OperatorSerialized {
    type: OperatorType.Step;
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
        if (this.type === StepType.Slot) {
            const target = this.resolveSlotTarget(character);
            if (target) {
                const path = this.level.findNear(
                    [character.cell.x, character.cell.y],
                    cell => cell === target,
                );
                if (path.length > 1 && path[1]) {
                    character.nextMove = path[1];
                }
            }
        }
    }

    execute(character: Character):number {
        if (this.type === StepType.Direction) {
            const direction = randomArray(this.directions);
            const status = character.step(direction);
            // A tile occupied by another worker makes the worker wait (and swap
            // on a head-on pass); an ineffective step (wall) still completes.
            return status === StepStatus.Blocked ? character.currentLine : character.currentLine + 1;
        }
        // Stepping to a memory target: stay on this command until the worker arrives.
        const finished = character.stepToSlot(this.slot ?? 0);
        return finished ? character.currentLine + 1 : character.currentLine;
    }

    private resolveSlotTarget(character: Character) {
        const slot = character.slots[this.slot];
        if (!slot || slot.isNothing()) return undefined;
        const cell = slot.getCellValue();
        if (cell) return cell;
        const worker = slot.getCharacterValue();
        if (worker) return worker.cell;
        const box = slot.getBox();
        if (box) {
            return Object.values(this.level.cells).find(cell => cell.item === box);
        }
        return undefined;
    }

    private getDirectionFromOffset(dx: number, dy: number): Direction | undefined {
        if (dx === 0 && dy === -1) return Direction.Up;
        if (dx === 0 && dy === 1) return Direction.Down;
        if (dx === -1 && dy === 0) return Direction.Left;
        if (dx === 1 && dy === 0) return Direction.Right;
        if (dx === -1 && dy === -1) return Direction.UpLeft;
        if (dx === 1 && dy === -1) return Direction.UpRight;
        if (dx === -1 && dy === 1) return Direction.DownLeft;
        if (dx === 1 && dy === 1) return Direction.DownRight;
        return undefined;
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

    deserialize(operator: OperatorStepSerialized): void {
        this.type = operator.stepType;
        this.directions = operator.directions;
        this.slot = operator.slot;
    }
}

export default OperatorStep;
