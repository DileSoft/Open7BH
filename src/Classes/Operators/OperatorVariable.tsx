import Character from '../Character';
import NumberSlot from '../NumberSlot';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export enum OperatorVariableType {
    Number = 'number',
    Slot = 'slot',
    MyItem = 'myItem',
}

export interface OperatorVariableSerialized extends OperatorSerialized {
    type: OperatorType.Variable,
    slot: number,
    variableType: OperatorVariableType,
    numberValue: number,
    slotValue: number,
    object?: OperatorVariable,
}

class OperatorVariable extends Operator {
    slot = 0;

    variableType = OperatorVariableType.Number;

    numberValue = 0;

    slotValue = 0;

    execute(character: Character): number {
        if (this.variableType === OperatorVariableType.Number) {
            character.slots[this.slotValue] = new NumberSlot(character);
            (character.slots[this.slotValue] as NumberSlot).setNumber(this.numberValue);
        }
        return character.currentLine + 1;
    }

    setSlot(slot: number) {
        this.slot = slot;
    }

    setNumberValue(value: number) {
        this.variableType = OperatorVariableType.Number;
        this.numberValue = value;
    }

    setSlotValue(value: number) {
        this.variableType = OperatorVariableType.Slot;
        this.slotValue = value;
    }

    setMyItemValue() {
        this.variableType = OperatorVariableType.MyItem;
    }

    serialize(withObject: boolean): OperatorVariableSerialized {
        return {
            type: OperatorType.Variable,
            slot: this.slot,
            variableType: this.variableType,
            numberValue: this.numberValue,
            slotValue: this.slotValue,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorVariableSerialized): void {
        this.slot = operator.slot;
        this.variableType = operator.variableType;
        this.numberValue = operator.numberValue;
        this.slotValue = operator.slotValue;
    }
}

export default OperatorVariable;
