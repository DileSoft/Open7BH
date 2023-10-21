import Character from '../Character';
import Level from '../Level';
import Slot from '../Slot';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import OperatorEndIf from './OperatorEndIf';

enum OperatorIfCondition {
    Eq = 'eq',
    Ne = 'ne',
    Gt = 'gt',
    Ge = 'ge',
    Lt = 'lt',
    Le = 'le',
}

enum OperatorIfLogic {
    And = 'and',
    Or = 'or',
}

enum OperandIfType {
    Number = 'number',
    Slot = 'slot',
}

interface IfCondition {
    type: OperatorIfCondition;
    leftType: OperandIfType;
    leftNumber?: number;
    leftSlot?: number,
    rightType: OperandIfType;
    rightNumber?: number;
    rightSlot?: number,
    logic?: OperatorIfLogic;
}

export interface OperatorIfSerialized extends OperatorSerialized {
    type: OperatorType.If,
    conditions: IfCondition[],
    operatorEndIf: string
    object?: OperatorIf,
}

class OperatorIf extends Operator {
    operatorEndIf: OperatorEndIf;

    conditions: IfCondition[] = [];

    constructor(level: Level) {
        super(level);
        this.conditions.push({
            type: OperatorIfCondition.Eq,
            leftType: OperandIfType.Number,
            leftNumber: 0,
            leftSlot: null,
            rightType: OperandIfType.Number,
            rightNumber: 0,
            rightSlot: null,
            logic: OperatorIfLogic.Or,
        });
    }

    checkCondition(character: Character): boolean {
        let result = false;
        this.conditions.forEach(condition => {
            let conditionResult = false;
            let left = 0;
            let right = 0;
            if (condition.leftType === OperandIfType.Number) {
                left = condition.leftNumber;
            } else if (condition.leftType === OperandIfType.Slot) {
                left = character.slots[condition.leftSlot].getNumberValue();
            }
            if (condition.rightType === OperandIfType.Number) {
                right = condition.rightNumber;
            } else if (condition.rightType === OperandIfType.Slot) {
                right = character.slots[condition.rightSlot].getNumberValue();
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
            if (condition.logic === OperatorIfLogic.And) {
                result = result && conditionResult;
            } else if (condition.logic === OperatorIfLogic.Or) {
                result = result || conditionResult;
            }
        });
        return result;
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
            conditions: this.conditions,
            operatorEndIf: this.operatorEndIf.id,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorIf;
