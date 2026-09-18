import BoxSlot from '../BoxSlot';
import CellSlot from '../CellSlot';
import Character from '../Character';
import NothingSlot from '../NothingSlot';
import NumberSlot from '../NumberSlot';
import WorkerSlot from '../WorkerSlot';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import { DirectionWithHere } from './OperatorStep';

export enum OperatorVariableType {
    Number = 'number',
    Slot = 'slot',
    MyItem = 'myItem',
    Direction = 'direction',
    // Deprecated: kept for backward compatibility with old saves.
    // UI should only offer Number/Slot/MyItem/Direction.
    Cell = 'cell',
    Worker = 'worker',
    Nothing = 'nothing',
}

export interface OperatorVariableSerialized extends OperatorSerialized {
    type: OperatorType.Variable,
    slot: number,
    variableType: OperatorVariableType,
    numberValue: number,
    slotValue: number,
    directionValue?: DirectionWithHere,
    object?: OperatorVariable,
}

class OperatorVariable extends Operator {
    slot = 0;

    variableType = OperatorVariableType.Number;

    numberValue = 0;

    slotValue = 0;

    directionValue: DirectionWithHere = DirectionWithHere.Here;

    execute(character: Character): number {
        const target = this.slot;
        if (this.variableType === OperatorVariableType.Number) {
            const slot = new NumberSlot(character);
            slot.setNumber(this.numberValue);
            character.slots[target] = slot;
        } else if (this.variableType === OperatorVariableType.Slot) {
            const source = character.slots[this.slotValue];
            if (!source || source.isNothing()) {
                character.slots[target] = new NothingSlot(character);
            } else {
                const box = source.getBox();
                const cell = source.getCellValue();
                const worker = source.getCharacterValue();
                if (box && !box.destroyed) {
                    const slot = new BoxSlot(character);
                    slot.setBox(box);
                    character.slots[target] = slot;
                } else if (cell) {
                    const slot = new CellSlot(character);
                    slot.setCell(cell);
                    character.slots[target] = slot;
                } else if (worker) {
                    const slot = new WorkerSlot(character);
                    slot.setWorker(worker);
                    character.slots[target] = slot;
                } else {
                    const num = source.getNumberValue();
                    if (num === undefined) {
                        character.slots[target] = new NothingSlot(character);
                    } else {
                        const slot = new NumberSlot(character);
                        slot.setNumber(num);
                        character.slots[target] = slot;
                    }
                }
            }
        } else if (this.variableType === OperatorVariableType.MyItem) {
            if (character.item && !character.item.destroyed) {
                const slot = new BoxSlot(character);
                slot.setBox(character.item);
                character.slots[target] = slot;
            } else {
                character.slots[target] = new NothingSlot(character);
            }
        } else if (this.variableType === OperatorVariableType.Direction) {
            // memX = set <direction>: store whatever is in the cell in that direction.
            // Worker cell -> worker reference, cube on floor -> cell reference,
            // empty cell -> nothing.
            const cell = this.level.getMoveCell(character.cell.x, character.cell.y, this.directionValue);
            if (!cell) {
                character.slots[target] = new NothingSlot(character);
            } else if (cell.character) {
                const slot = new WorkerSlot(character);
                slot.setWorker(cell.character);
                character.slots[target] = slot;
            } else {
                const slot = new CellSlot(character);
                slot.setCell(cell);
                character.slots[target] = slot;
            }
        } else if (this.variableType === OperatorVariableType.Cell
            || this.variableType === OperatorVariableType.Worker
            || this.variableType === OperatorVariableType.Nothing) {
            // Backward compatibility: old saves stored Cell/Worker/Nothing directly.
            // Treat them as Direction with the stored directionValue.
            const cell = this.level.getMoveCell(character.cell.x, character.cell.y, this.directionValue);
            if (this.variableType === OperatorVariableType.Nothing || !cell) {
                character.slots[target] = new NothingSlot(character);
            } else if (this.variableType === OperatorVariableType.Worker && cell.character) {
                const slot = new WorkerSlot(character);
                slot.setWorker(cell.character);
                character.slots[target] = slot;
            } else if (this.variableType === OperatorVariableType.Worker) {
                character.slots[target] = new NothingSlot(character);
            } else if (cell.character) {
                const slot = new WorkerSlot(character);
                slot.setWorker(cell.character);
                character.slots[target] = slot;
            } else {
                const slot = new CellSlot(character);
                slot.setCell(cell);
                character.slots[target] = slot;
            }
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

    setDirectionValue(direction: DirectionWithHere = DirectionWithHere.Here) {
        this.variableType = OperatorVariableType.Direction;
        this.directionValue = direction;
    }

    /** @deprecated Use setDirectionValue. Kept for old saves. */
    setCellValue(direction: DirectionWithHere = DirectionWithHere.Here) {
        this.variableType = OperatorVariableType.Cell;
        this.directionValue = direction;
    }

    /** @deprecated Use setDirectionValue. Kept for old saves. */
    setWorkerValue(direction: DirectionWithHere = DirectionWithHere.Here) {
        this.variableType = OperatorVariableType.Worker;
        this.directionValue = direction;
    }

    /** @deprecated Nothing is now implicit (empty direction cell). Kept for old saves. */
    setNothingValue() {
        this.variableType = OperatorVariableType.Nothing;
    }

    serialize(withObject: boolean): OperatorVariableSerialized {
        return {
            type: OperatorType.Variable,
            slot: this.slot,
            variableType: this.variableType,
            numberValue: this.numberValue,
            slotValue: this.slotValue,
            directionValue: this.directionValue,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorVariableSerialized): void {
        this.slot = operator.slot;
        this.variableType = operator.variableType;
        this.numberValue = operator.numberValue;
        this.slotValue = operator.slotValue;
        this.directionValue = operator.directionValue ?? DirectionWithHere.Here;
    }
}

export default OperatorVariable;
