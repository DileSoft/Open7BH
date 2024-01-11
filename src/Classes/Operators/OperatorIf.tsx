import { CellType } from '../Cell';
import CellSlot from '../CellSlot';
import Character from '../Character';
import Level from '../Level';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import OperatorEndIf from './OperatorEndIf';
import { Direction, DirectionWithHere } from './OperatorStep';

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

    checkCondition(character: Character): boolean {
        let result = false;
        this.conditions.forEach(condition => {
            let conditionResult = false;
            const isEqual = condition.type === OperatorIfCondition.Eq;
            if (condition.rightType === OperandIfRightType.Box) {
                if (condition.leftType === OperandIfLeftType.MyItem) {
                    conditionResult = !!character.item;
                    if (!isEqual) {
                        conditionResult = !conditionResult;
                    }
                }
                if (condition.leftType === OperandIfLeftType.Slot) {
                    if (character.slots[condition.leftSlot] instanceof CellSlot) {
                        conditionResult = !!(character.slots[condition.leftSlot] as CellSlot).cellValue.item;
                        if (!isEqual) {
                            conditionResult = !conditionResult;
                        }
                    }
                }
                if (condition.leftType === OperandIfLeftType.Direction) {
                    conditionResult = !!this.level.getMoveCell(character.cell.x, character.cell.y, condition.leftDirection).item;
                    if (!isEqual) {
                        conditionResult = !conditionResult;
                    }
                }
            } else if (condition.rightType === OperandIfRightType.Printer ||
                 condition.rightType === OperandIfRightType.Shredder ||
                 condition.rightType === OperandIfRightType.Hole) {
                if (condition.leftType === OperandIfLeftType.Slot) {
                    if (character.slots[condition.leftSlot] instanceof CellSlot) {
                        conditionResult = (character.slots[condition.leftSlot] as CellSlot).cellValue.getType() === condition.rightType as string;
                        if (!isEqual) {
                            conditionResult = !conditionResult;
                        }
                    }
                }
                if (condition.leftType === OperandIfLeftType.Direction) {
                    conditionResult = this.level.getMoveCell(character.cell.x, character.cell.y, condition.leftDirection).getType() === condition.rightType as string;
                    if (!isEqual) {
                        conditionResult = !conditionResult;
                    }
                }
            } else {
                let left = 0;
                let right = 0;
                if (condition.leftType === OperandIfLeftType.Number) {
                    left = condition.leftNumber;
                } else if (condition.leftType === OperandIfLeftType.Slot) {
                    left = character.slots[condition.leftSlot].getNumberValue();
                } else if (condition.leftType === OperandIfLeftType.MyItem) {
                    left = character.item?.value || 0;
                } else if (condition.leftType === OperandIfLeftType.Direction) {
                    left = this.level.getMoveCell(character.cell.x, character.cell.y, condition.leftDirection).item?.value || 0;
                }
                if (condition.rightType === OperandIfRightType.Number) {
                    right = condition.rightNumber;
                } else if (condition.rightType === OperandIfRightType.Slot) {
                    right = character.slots[condition.rightSlot].getNumberValue();
                } else if (condition.rightType === OperandIfRightType.MyItem) {
                    right = character.item?.value || 0;
                } else if (condition.rightType === OperandIfRightType.Direction) {
                    right = this.level.getMoveCell(character.cell.x, character.cell.y, condition.rightDirection).item?.value || 0;
                }
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
            operatorEndIf: this.operatorEndIf.id,
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
