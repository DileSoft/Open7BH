import Box from '../Box';
import Cell, { CellType } from '../Cell';
import Character from '../Character';
import Level from '../Level';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import OperatorEndIf from './OperatorEndIf';
import { DirectionWithHere } from './OperatorStep';

export enum OperatorIfCondition {
    Eq = 'eq',
    Ne = 'ne',
    Gt = 'gt',
    Ge = 'ge',
    Lt = 'lt',
    Le = 'le',
}

export enum OperatorIfLogic {
    And = 'and',
    Or = 'or',
}

export enum OperandIfLeftType {
    Direction = 'direction',
    Number = 'number',
    Slot = 'slot',
    MyItem = 'myItem',
}

export enum OperandIfRightType {
    Direction = 'direction',
    Number = 'number',
    Slot = 'slot',
    MyItem = 'myItem',
    Box = 'box',
    Printer = 'printer',
    Shredder = 'shredder',
    Character = 'character',
    Hole = 'hole',
    Wall = 'wall',
    Empty = 'empty',
    Nothing = 'nothing',
}

export interface IfCondition {
    type: OperatorIfCondition;
    leftType: OperandIfLeftType;
    leftNumber?: number;
    leftSlot?: number,
    leftDirection?: DirectionWithHere,
    rightType: OperandIfRightType;
    rightNumber?: number;
    rightSlot?: number,
    rightDirection?: DirectionWithHere,
    logic?: OperatorIfLogic;
}

export interface OperatorIfSerialized extends OperatorSerialized {
    type: OperatorType.If,
    id: string,
    conditions: IfCondition[],
    operatorEndIf: string
    object?: OperatorIf,
}

class OperatorIf extends Operator {
    operatorEndIfId: string;

    operatorEndIf: OperatorEndIf;

    conditions: IfCondition[] = [];

    constructor(level: Level) {
        super(level);
        this.addCondition();
    }

    addCondition() {
        this.conditions.push({
            type: OperatorIfCondition.Eq,
            leftType: OperandIfLeftType.Number,
            leftDirection: DirectionWithHere.Down,
            leftNumber: 0,
            leftSlot: 0,
            rightType: OperandIfRightType.Number,
            rightDirection: DirectionWithHere.Down,
            rightNumber: 0,
            rightSlot: 0,
            logic: OperatorIfLogic.Or,
        });
    }

    removeCondition(conditionKey: number) {
        this.conditions.splice(conditionKey, 1);
    }

    // Item "in a direction": from the cell's floor, or held by the character standing there.
    private getDirectionBox(cell?: Cell): Box | undefined {
        if (!cell) return undefined;
        const ground = cell.item;
        if (ground && !ground.destroyed) return ground;
        const held = cell.character?.item;
        if (held && !held.destroyed) return held;
        return undefined;
    }

    checkCondition(character: Character): boolean {
        let result = false;
        this.conditions.forEach(condition => {
            let conditionResult = false;
            const isEqual = condition.type === OperatorIfCondition.Eq;
            const leftCell = condition.leftDirection !== undefined
                ? this.level.getMoveCell(character.cell.x, character.cell.y, condition.leftDirection)
                : undefined;
            const rightCell = condition.rightDirection !== undefined
                ? this.level.getMoveCell(character.cell.x, character.cell.y, condition.rightDirection)
                : undefined;
            const cellTypeOf = (cell?: ReturnType<Level['getMoveCell']>): string => {
                if (!cell) return CellType.Wall;
                return cell.getType();
            };
            if (condition.rightType === OperandIfRightType.Box) {
                if (condition.leftType === OperandIfLeftType.MyItem) {
                    conditionResult = !!character.item && !character.item.destroyed;
                    if (!isEqual) {
                        conditionResult = !conditionResult;
                    }
                }
                if (condition.leftType === OperandIfLeftType.Slot) {
                    conditionResult = !!character.slots[condition.leftSlot ?? 0]?.getBox();
                    if (!isEqual) {
                        conditionResult = !conditionResult;
                    }
                }
                if (condition.leftType === OperandIfLeftType.Direction) {
                    conditionResult = !!leftCell?.item && !leftCell.item.destroyed;
                    if (!isEqual) {
                        conditionResult = !conditionResult;
                    }
                }
            } else if (condition.rightType === OperandIfRightType.Printer ||
                 condition.rightType === OperandIfRightType.Shredder ||
                 condition.rightType === OperandIfRightType.Hole ||
                 condition.rightType === OperandIfRightType.Wall ||
                 condition.rightType === OperandIfRightType.Empty) {
                if (condition.leftType === OperandIfLeftType.Slot) {
                    const cell = character.slots[condition.leftSlot ?? 0]?.getCellValue();
                    conditionResult = !!cell && cell.getType() === (condition.rightType as string);
                    if (!isEqual) {
                        conditionResult = !conditionResult;
                    }
                }
                if (condition.leftType === OperandIfLeftType.Direction) {
                    conditionResult = cellTypeOf(leftCell) === (condition.rightType as string);
                    if (!isEqual) {
                        conditionResult = !conditionResult;
                    }
                }
            } else if (condition.rightType === OperandIfRightType.Nothing) {
                if (condition.leftType === OperandIfLeftType.Slot) {
                    conditionResult = !!character.slots[condition.leftSlot ?? 0]?.isNothing();
                    if (!isEqual) {
                        conditionResult = !conditionResult;
                    }
                }
                if (condition.leftType === OperandIfLeftType.MyItem) {
                    conditionResult = !character.item || character.item.destroyed;
                    if (!isEqual) {
                        conditionResult = !conditionResult;
                    }
                }
                if (condition.leftType === OperandIfLeftType.Direction) {
                    const item = leftCell?.item;
                    conditionResult = !item || item.destroyed;
                    if (!isEqual) {
                        conditionResult = !conditionResult;
                    }
                }
            } else if (condition.rightType === OperandIfRightType.Character) {
                if (condition.leftType === OperandIfLeftType.Direction) {
                    conditionResult = !!leftCell?.character;
                    if (!isEqual) {
                        conditionResult = !conditionResult;
                    }
                }
                if (condition.leftType === OperandIfLeftType.Slot) {
                    conditionResult = !!character.slots[condition.leftSlot ?? 0]?.getCharacterValue();
                    if (!isEqual) {
                        conditionResult = !conditionResult;
                    }
                }
            } else {
                let left: number | undefined = 0;
                let right: number | undefined = 0;
                if (condition.leftType === OperandIfLeftType.Number) {
                    left = condition.leftNumber;
                } else if (condition.leftType === OperandIfLeftType.Slot) {
                    left = character.slots[condition.leftSlot ?? 0]?.getNumberValue();
                } else if (condition.leftType === OperandIfLeftType.MyItem) {
                    left = character.item && !character.item.destroyed ? character.item.value : undefined;
                } else if (condition.leftType === OperandIfLeftType.Direction) {
                    const item = this.getDirectionBox(leftCell);
                    left = item ? item.value : undefined;
                }
                if (condition.rightType === OperandIfRightType.Number) {
                    right = condition.rightNumber;
                } else if (condition.rightType === OperandIfRightType.Slot) {
                    right = character.slots[condition.rightSlot ?? 0]?.getNumberValue();
                } else if (condition.rightType === OperandIfRightType.MyItem) {
                    right = character.item && !character.item.destroyed ? character.item.value : undefined;
                } else if (condition.rightType === OperandIfRightType.Direction) {
                    const item = this.getDirectionBox(rightCell);
                    right = item ? item.value : undefined;
                }
                if (left === undefined || right === undefined) {
                    if (condition.type === OperatorIfCondition.Eq) {
                        conditionResult = left === right;
                    } else if (condition.type === OperatorIfCondition.Ne) {
                        conditionResult = left !== right;
                    } else {
                        conditionResult = false;
                    }
                } else {
                    switch (condition.type) {
                        case OperatorIfCondition.Eq:
                            conditionResult = left === right;
                            break;
                        case OperatorIfCondition.Ne:
                            conditionResult = left !== right;
                            break;
                        case OperatorIfCondition.Gt:
                            conditionResult = left > right;
                            break;
                        case OperatorIfCondition.Ge:
                            conditionResult = left >= right;
                            break;
                        case OperatorIfCondition.Lt:
                            conditionResult = left < right;
                            break;
                        case OperatorIfCondition.Le:
                            conditionResult = left <= right;
                            break;
                        default:
                            break;
                    }
                }
            }
            if (condition.logic === OperatorIfLogic.And) {
                result = result && conditionResult;
            } else if (condition.logic === OperatorIfLogic.Or) {
                result = result || conditionResult;
            }
        });
        return result;
    }

    remove() {
        const endIf = this.level.game.code.findIndex(operator => operator === this.operatorEndIf);
        this.level.game.code.splice(endIf, 1);
    }

    execute(character: Character): number {
        if (this.checkCondition(character)) {
            return character.currentLine + 1;
        }
        return this.level.game.code.findIndex(operator => operator === this.operatorEndIf) + 1;
    }

    createEndIf(): OperatorEndIf {
        const operatorEndIf = new OperatorEndIf(this.level);
        operatorEndIf.operatorIf = this;
        this.operatorEndIf = operatorEndIf;

        return operatorEndIf;
    }

    serialize(withObject: boolean): OperatorIfSerialized {
        return {
            type: OperatorType.If,
            id: this.id,
            conditions: this.conditions,
            operatorEndIf: this.operatorEndIf?.id,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorIfSerialized): void {
        this.id = operator.id;
        this.operatorEndIfId = operator.operatorEndIf;
        this.conditions = operator.conditions;
    }

    postDeserialize() {
        this.operatorEndIf = this.level.game.code.find(_operator => _operator.id === this.operatorEndIfId) as OperatorEndIf;
    }
}

export default OperatorIf;
