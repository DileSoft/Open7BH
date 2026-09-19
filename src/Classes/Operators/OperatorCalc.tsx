import Character from '../Character';
import NumberSlot from '../NumberSlot';
import Operator, { OperatorType } from './Operator';
import { DirectionWithHere } from './OperatorStep';

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
    MyItem = 'myItem',
}

export interface OperatorCalcSerialized {
    type: OperatorType.Calc,
    operand1type: CalcOperand,
    operand1NumberValue: number,
    operand1DirectionValue: DirectionWithHere,
    operand1SlotValue: number,
    operator: CalcOperator,
    operand2type: CalcOperand,
    operand2NumberValue: number,
    operand2DirectionValue: DirectionWithHere,
    operand2SlotValue: number,
    slotResult: number,
    object?: OperatorCalc,
}

class OperatorCalc extends Operator {
    operand1type: CalcOperand = CalcOperand.Number;

    operand1NumberValue = 0;

    operand1DirectionValue: DirectionWithHere = DirectionWithHere.Up;

    operand1SlotValue = 0;

    operator: CalcOperator = CalcOperator.Add;

    operand2type: CalcOperand = CalcOperand.Number;

    operand2NumberValue = 0;

    operand2DirectionValue: DirectionWithHere = DirectionWithHere.Up;

    operand2SlotValue = 0;

    slotResult = 0;

    execute(character: Character):number {
        const readOperand = (operandType: CalcOperand, numberValue: number, directionValue: DirectionWithHere, slotValue: number): number | undefined => {
            if (operandType === CalcOperand.Number) return numberValue;
            if (operandType === CalcOperand.Direction) {
                const item = this.level.getMoveCell(character.cell.x, character.cell.y, directionValue)?.item;
                if (!item || item.destroyed) return undefined;
                return item.value;
            }
            if (operandType === CalcOperand.Slot) {
                return character.slots[slotValue]?.getNumberValue();
            }
            if (operandType === CalcOperand.MyItem) {
                if (!character.item || character.item.destroyed) return undefined;
                return character.item.value;
            }
            return undefined;
        };
        const value1 = readOperand(this.operand1type, this.operand1NumberValue, this.operand1DirectionValue, this.operand1SlotValue);
        const value2 = readOperand(this.operand2type, this.operand2NumberValue, this.operand2DirectionValue, this.operand2SlotValue);
        if (value1 === undefined || value2 === undefined) {
            character.stun();
            return character.currentLine + 1;
        }
        let result = 0;

        if (this.operator === CalcOperator.Add) {
            result = value1 + value2;
        } else if (this.operator === CalcOperator.Subtract) {
            result = value1 - value2;
        } else if (this.operator === CalcOperator.Multiply) {
            result = value1 * value2;
        } else if (this.operator === CalcOperator.Divide) {
            if (value2 === 0) {
                character.stun();
                return character.currentLine + 1;
            }
            result = Math.trunc(value1 / value2);
        }

        const slot = new NumberSlot(character);
        slot.setNumber(result);
        character.slots[this.slotResult] = slot;
        character.flashCalc(`${value1} ${this.operator} ${value2} = ${slot.getNumberValue()}`);
        return character.currentLine + 1;
    }

    setOperand1MyItem() {
        this.operand1type = CalcOperand.MyItem;
    }

    setOperand1Number(value: number) {
        this.operand1type = CalcOperand.Number;
        this.operand1NumberValue = value;
    }

    setOperand1Direction(value: DirectionWithHere) {
        this.operand1type = CalcOperand.Direction;
        this.operand1DirectionValue = value;
    }

    setOperand1Slot(value: number) {
        this.operand1type = CalcOperand.Slot;
        this.operand1SlotValue = value;
    }

    setOperand2MyItem() {
        this.operand2type = CalcOperand.MyItem;
    }

    setOperand2Number(value: number) {
        this.operand2type = CalcOperand.Number;
        this.operand2NumberValue = value;
    }

    setOperand2Direction(value: DirectionWithHere) {
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

    deserialize(serialized: OperatorCalcSerialized) {
        this.operand1type = serialized.operand1type;
        this.operand1NumberValue = serialized.operand1NumberValue;
        this.operand1DirectionValue = serialized.operand1DirectionValue;
        this.operand1SlotValue = serialized.operand1SlotValue;
        this.operator = serialized.operator;
        this.operand2type = serialized.operand2type;
        this.operand2NumberValue = serialized.operand2NumberValue;
        this.operand2DirectionValue = serialized.operand2DirectionValue;
        this.operand2SlotValue = serialized.operand2SlotValue;
        this.slotResult = serialized.slotResult;
    }
}

export default OperatorCalc;
