import Character from '../Character';
import NumberSlot from '../NumberSlot';
import Operator from './Operator';
import { Direction[] } from './OperatorStep';

enum CalcOperator {
    Add = '+',
    Subtract = '-',
    Multiply = '*',
    Divide = '/',
}

enum CalcOperand {
    Number = 'number',
    Direction = 'direction',
    Slot = 'slot',
}

class OperatorCalc extends Operator {
    operand1type: CalcOperand = CalcOperand.Number;

    operand1NumberValue = 0;

    operand1DirectionValue: Direction[] = Direction[].Up;

    operand1SlotValue = 0;

    operator: CalcOperator = CalcOperator.Add;

    operand2type: CalcOperand = CalcOperand.Number;

    operand2NumberValue = 0;

    operand2DirectionValue: Direction[] = Direction[].Up;

    operand2SlotValue = 0;

    slotResult = 0;

    execute(character: Character):void {
        let value1 = 0;
        let value2 = 0;
        let result = 0;
        if (this.operand1type === CalcOperand.Number) {
            value1 = this.operand1NumberValue;
        }
        if (this.operand2type === CalcOperand.Number) {
            value2 = this.operand2NumberValue;
        }

        if (this.operator === CalcOperator.Add) {
            result = value1 + value2;
        } else if (this.operator === CalcOperator.Subtract) {
            result = value1 - value2;
        } else if (this.operator === CalcOperator.Multiply) {
            result = value1 * value2;
        } else if (this.operator === CalcOperator.Divide) {
            result = value1 / value2;
        }

        const slot = new NumberSlot(character);
        slot.setNumber(result);
        character.slots[this.slotResult] = slot;
    }
}

export default OperatorCalc;
