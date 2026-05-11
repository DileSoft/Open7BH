import Box from './Box';
import Cell, { CellType } from './Cell';
import NumberSlot from './NumberSlot';
import { Direction } from './Operators/OperatorStep';
import Printer from './Printer';
import Shredder from './Shredder';
import Slot from './Slot';

export enum CharacterState {
    Idle = 'idle',
    Moving = 'moving',
    Taking = 'taking',
    PickingUp = 'pickingUp',
    Dropping = 'dropping',
    Giving = 'giving',
    Dying = 'dying',
    Dead = 'dead',
}

class Character {
    name: string;

    color = 'green';

    cell: Cell;

    item: Box | null = null;

    isTerminated = false;

    _isDead = false;

    state: CharacterState = CharacterState.Idle;
    stateTimer: number = 0;
    targetCell: Cell | null = null;
    actionDirection: Direction | null = null;

    get isDead() {
        return this._isDead;
    }

    set isDead(value: boolean) {
        this._isDead = value;
        if (value) this.state = CharacterState.Dead;
        Cell.renderer?.updateCharacter(this);
    }

    slots: Slot[] = [];

    currentLine = 0;

    hear?: string;

    nextMove?: Cell;

    operationDone = false;

    foreachLoops: {
        [id: string]: Direction,
    }[] = [];

    constructor(cell: Cell, name: string) {
        this.cell = cell;
        this.name = name;
        for (let i = 0; i < 4; i++) {
            this.slots.push(new NumberSlot(this));
        }
        Cell.renderer?.registerCharacter(this);
    }

    prepareMove(direction: Direction) {
        this.nextMove = this.getMoveCell(direction, true);
    }

    prepare() {
        if (this.isTerminated) {
            return;
        }
        if (this.hear) {
            return;
        }
        const code = this.cell.level.game.code;
        if (this.currentLine >= code.length) {
            return;
        }
        const operator = code[this.currentLine];
        operator.prepare(this);
    }

    update() {
        if (this.isTerminated || this.state === CharacterState.Dead) {
            return;
        }

        // State Machine processing
        switch (this.state) {
            case CharacterState.Idle:
                this.processNextCommand();
                break;
            case CharacterState.Moving:
                // Logic for moving state (waiting for renderer to signal completion or via timer)
                break;
            case CharacterState.Taking:
            case CharacterState.Dropping:
            case CharacterState.Giving:
                // These act as "durational" states. 
                // They can be cleared by the renderer or a fixed logic tick.
                break;
            default:
                break;
        }
    }

    private processNextCommand() {
        if (this.hear || this.operationDone) {
            this.operationDone = false;
            return;
        }
        const code = this.cell.level.game.code;
        if (this.currentLine >= code.length) {
            this.isTerminated = true;
            return;
        }
        const operator = code[this.currentLine];
        this.currentLine = operator.execute(this);
        if (this.currentLine >= code.length) {
            this.isTerminated = true;
        }
    }

    step(direction: Direction) {
        const nextCell = this.getMoveCell(direction);
        if (nextCell) {
            // Initiate move sequence
            this.targetCell = nextCell;
            this.state = CharacterState.Moving;
            
            // Logically move immediately to reserve the cell, 
            // but the renderer will handle the visual transition
            this.cell.character = null;
            this.cell = nextCell;
            nextCell.character = this;
            
            Cell.renderer?.updateCharacter(this);
        } else {
            // Bump animation? For now just skip
            this.state = CharacterState.Idle;
        }
    }

    setItem(item: Box | null) {
        this.item = item;
        Cell.renderer?.updateCharacter(this);
    }

    giveItem(direction: Direction):void {
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        if (newCell && newCell.character && !newCell.character.item && this.item) {
            this.setState(CharacterState.Giving);
            newCell.character.setItem(this.item);
            newCell.character.operationDone = true;
            this.item = null;
            // For now, switch back to Idle manually after logic
            // In a real animation system, we'd wait for animation end
            setTimeout(() => this.setState(CharacterState.Idle), 500);
        }
        if (newCell && (newCell instanceof Shredder) && this.item) {
            this.setState(CharacterState.Giving);
            newCell.shred();
            this.item = null;
            setTimeout(() => this.setState(CharacterState.Idle), 500);
        }
    }

    take(direction: Direction):void {
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        if (newCell && (newCell instanceof Printer) && !this.item) {
            this.setState(CharacterState.Taking);
            this.item = new Box(newCell.print());
            setTimeout(() => this.setState(CharacterState.Idle), 500);
        }
    }

    write(value: number) {
        if (this.item) {
            this.item.value = value;
        }
    }

    pickupItem() {
        const item = this.cell.getItem();
        if (item && !this.item) {
            this.setState(CharacterState.PickingUp);
            this.setItem(item);
            this.cell.removeItem();
            setTimeout(() => this.setState(CharacterState.Idle), 500);
        }
    }

    dropItem() {
        if (this.item && !this.cell.getItem()) {
            this.setState(CharacterState.Dropping);
            this.cell.setItem(this.item);
            this.item = null;
            setTimeout(() => this.setState(CharacterState.Idle), 500);
        }
    }

    getMoveCell(direction: Direction, prepare = false):Cell | undefined {
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        return newCell && newCell.isEmpty 
        && (newCell.getType() === CellType.Empty || newCell.getType() === CellType.Hole)
        && (prepare || !newCell.character) ? newCell : undefined;
    }

    say(text: string, direction: Direction) {
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        if (newCell && newCell.character && newCell.character.hear === text) {
            newCell.character.hear = undefined;
            newCell.character.currentLine++;
        }
    }

    terminate() {
        this.isTerminated = true;
    }

    die() {
        this.state = CharacterState.Dying;
        this.isDead = true;
        this.terminate();
        this.cell.character = null;
    }

    setState(state: CharacterState) {
        this.state = state;
        Cell.renderer?.updateCharacter(this);
    }
}

export default Character;
