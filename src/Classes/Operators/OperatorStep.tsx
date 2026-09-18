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
            character.step(direction);
        }
        if (this.type === StepType.Slot) {
            const target = this.resolveSlotTarget(character);
            if (!target) {
                character.stun();
            } else {
                const path = this.level.findNear(
                    [character.cell.x, character.cell.y],
                    cell => cell === target,
                );
                if (path.length > 1 && path[1]) {
                    const dx = path[1].x - character.cell.x;
                    const dy = path[1].y - character.cell.y;
                    const direction = this.getDirectionFromOffset(dx, dy);
                    if (!direction) {
                        character.stun();
                    } else {
                        character.step(direction);
                    }
                } else {
                    character.stun();
                }
            }
        }
        return character.currentLine + 1;
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
