import Character from '../Character';
import NumberSlot from '../NumberSlot';
import Operator, { OperatorType } from './Operator';
import { Direction } from './OperatorStep';

export enum CalcOperator {
    Add = '+',
    Subtract = '-',
    Multiply = '*',
    Divide = '/',
}

export enum CalcOperand {
    Number = 'number',
    Direction = 'direction',
    Slot = 'slot',
}

export interface OperatorCalcSerialized {
    type: OperatorType.Calc,
    operand1type: CalcOperand,
    operand1NumberValue: number,
    operand1DirectionValue: Direction,
    operand1SlotValue: number,
    operator: CalcOperator,
    operand2type: CalcOperand,
    operand2NumberValue: number,
    operand2DirectionValue: Direction,
    operand2SlotValue: number,
    slotResult: number,
    object?: OperatorCalc,
}

class OperatorCalc extends Operator {
    operand1type: CalcOperand = CalcOperand.Number;

    operand1NumberValue = 0;

    operand1DirectionValue: Direction = Direction.Up;

    operand1SlotValue = 0;

    operator: CalcOperator = CalcOperator.Add;

    operand2type: CalcOperand = CalcOperand.Number;

    operand2NumberValue = 0;

    operand2DirectionValue: Direction = Direction.Up;

    operand2SlotValue = 0;

    slotResult = 0;

    execute(character: Character):number {
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
        return character.currentLine + 1;
    }

    setOperand1Number(value: number) {
        this.operand1type = CalcOperand.Number;
        this.operand1NumberValue = value;
    }

    setOperand1Direction(value: Direction) {
        this.operand1type = CalcOperand.Direction;
        this.operand1DirectionValue = value;
    }

    setOperand1Slot(value: number) {
        this.operand1type = CalcOperand.Slot;
        this.operand1SlotValue = value;
    }

    setOperand2Number(value: number) {
        this.operand2type = CalcOperand.Number;
        this.operand2NumberValue = value;
    }

    setOperand2Direction(value: Direction) {
        this.operand2type = CalcOperand.Direction;
        this.operand2DirectionValue = value;
    }

    setOperand2Slot(value: number) {
        this.operand2type = CalcOperand.Slot;
        this.operand2SlotValue = value;
    }

    serialize(withObject = false): OperatorCalcSerialized {
        return {
            type: OperatorType.Calc,
            operand1type: this.operand1type,
            operand1NumberValue: this.operand1NumberValue,
            operand1DirectionValue: this.operand1DirectionValue,
            operand1SlotValue: this.operand1SlotValue,
            operator: this.operator,
            operand2type: this.operand2type,
            operand2NumberValue: this.operand2NumberValue,
            operand2DirectionValue: this.operand2DirectionValue,
            operand2SlotValue: this.operand2SlotValue,
            slotResult: this.slotResult,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorCalc;
