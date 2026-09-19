import Box, { clampInt32 } from './Box';
import Cell, { CellType } from './Cell';
import NumberSlot from './NumberSlot';
import { Direction } from './Operators/OperatorStep';
import Printer from './Printer';
import Shredder from './Shredder';
import Hole from './Hole';
import Slot from './Slot';

export enum CharacterState {
    Idle = 'idle',
    Moving = 'moving',
    Taking = 'taking',
    PickingUp = 'pickingUp',
    Dropping = 'dropping',
    Giving = 'giving',
    Writing = 'writing',
    Calculating = 'calculating',
    Saying = 'saying',
    Listening = 'listening',
    Stunned = 'stunned',
    Dying = 'dying',
    Dead = 'dead',
}

export const STUN_DURATION_MS = 1000;

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

    /** Individual execution speed multiplier (1 = normal). */
    speedMultiplier = 1;

    /** Timestamp until which the worker is stunned (soft exception). */
    stunnedUntil = 0;

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

    /** Last spoken message + expiry, for the speech bubble. */
    lastSaidText?: string;

    lastSaidUntil = 0;

    /** Last calc expression, for the "thinking" bubble. */
    lastCalcText?: string;

    lastCalcUntil = 0;

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
        if (this.hear !== undefined) {
            return;
        }
        const code = this.cell.level.game.code;
        if (this.currentLine >= code.length) {
            return;
        }
        const operator = code[this.currentLine];
        operator.prepare(this);
    }

    private lastActionTime: number = 0;

    get tickInterval(): number {
        const base = this.cell.level.game.speed || 1000;
        return Math.max(1, base / (this.speedMultiplier || 1));
    }

    isStunned(now = Date.now()): boolean {
        return now < this.stunnedUntil;
    }

    /** Soft exception: stun the worker for ~1s instead of crashing the game. */
    stun(durationMs = STUN_DURATION_MS) {
        this.stunnedUntil = Date.now() + durationMs;
        this.setState(CharacterState.Stunned);
        Cell.renderer?.updateCharacter(this);
    }

    update() {
        if (this.isTerminated || this.state === CharacterState.Dead) {
            return;
        }

        const now = Date.now();
        if (this.state === CharacterState.Stunned) {
            if (!this.isStunned(now)) {
                this.setState(CharacterState.Idle);
            } else {
                return;
            }
        }

        // Only process next command if we are idle AND enough time has passed based on game speed
        if (this.state === CharacterState.Idle) {
            const speed = this.tickInterval;

            // If movement was the last action, we MUST ensure the renderer has actually
            // finished moving the character before we start a new command.
            if (now - this.lastActionTime >= speed - 1) {
                this.lastActionTime = now;
                this.processNextCommand();
            }
        }
    }

    private processNextCommand() {
        if (this.hear !== undefined || this.operationDone) {
            if (this.hear !== undefined && this.state === CharacterState.Idle) {
                this.setState(CharacterState.Listening);
            }
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
        this.actionDirection = direction;
        const target = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        if (!target) {
            // Edge of the room counts as a wall: soft exception.
            this.stun();
            return;
        }
        if (target.getType() === CellType.Wall) {
            this.stun();
            return;
        }
        if (target.getType() === CellType.Hole) {
            // Stepping into a hole kills the worker and fails the level instantly.
            this.cell.character = null;
            this.cell = target;
            target.character = this;
            Cell.renderer?.updateCharacter(this);
            this.die();
            this.cell.level.game.lose(`Worker ${this.name} fell into a hole`);
            return;
        }
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
            // Blocked (occupied / printer / shredder): soft exception.
            this.stun();
        }
    }

    setItem(item: Box | null) {
        this.item = item;
        Cell.renderer?.updateCharacter(this);
    }

    private resolveSlotCell(slotIndex: number): Cell | undefined {
        const slot = this.slots[slotIndex];
        if (!slot || slot.isNothing()) return undefined;
        const cell = slot.getCellValue();
        if (cell) return cell;
        const worker = slot.getCharacterValue();
        if (worker) return worker.cell;
        const box = slot.getBox();
        if (box) {
            return Object.values(this.cell.level.cells).find(cell => cell.item === box);
        }
        return undefined;
    }

    giveToSlot(slotIndex: number): void {
        const target = this.resolveSlotCell(slotIndex);
        if (!target) {
            this.stun();
            return;
        }
        const dx = target.x - this.cell.x;
        const dy = target.y - this.cell.y;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (dx === 0 && dy === 0)) {
            this.stun();
            return;
        }
        const direction = this.directionTo(target.x, target.y);
        if (!direction) {
            this.stun();
            return;
        }
        this.giveItem(direction);
    }

    private directionTo(x: number, y: number): Direction | undefined {
        const dx = x - this.cell.x;
        const dy = y - this.cell.y;
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

    giveItem(direction: Direction):void {
        this.actionDirection = direction;
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        if (!newCell) {
            this.stun();
            return;
        }
        if (!this.item) {
            this.stun();
            return;
        }
        if (newCell.character && !newCell.character.item) {
            this.setState(CharacterState.Giving);
            newCell.character.setItem(this.item);
            newCell.character.operationDone = true;
            this.item = null;

            const duration = Math.max(100, (this.cell.level.game.speed || 1000) * 0.8);
            setTimeout(() => {
                if (this.state === CharacterState.Giving) {
                    this.setState(CharacterState.Idle);
                }
            }, duration);
            return;
        }
        if (newCell instanceof Shredder) {
            this.setState(CharacterState.Giving);
            this.item.destroy();
            newCell.shred();
            this.item = null;

            const duration = Math.max(100, (this.cell.level.game.speed || 1000) * 0.8);
            setTimeout(() => {
                if (this.state === CharacterState.Giving) {
                    this.setState(CharacterState.Idle);
                }
            }, duration);
            return;
        }
        if (newCell instanceof Hole) {
            // Dropping a cube into a hole destroys it (works like a shredder).
            this.setState(CharacterState.Giving);
            this.item.destroy();
            this.item = null;
            Cell.renderer?.updateCharacter(this);

            const duration = Math.max(100, (this.cell.level.game.speed || 1000) * 0.8);
            setTimeout(() => {
                if (this.state === CharacterState.Giving) {
                    this.setState(CharacterState.Idle);
                }
            }, duration);
            return;
        }
        this.stun();
    }

    take(direction: Direction):void {
        this.actionDirection = direction;
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        if (!newCell) {
            this.stun();
            return;
        }
        if (this.item) {
            this.stun();
            return;
        }
        if (newCell.character?.item) {
            // Take a cube from a neighbouring worker (freezes the donor briefly).
            this.setState(CharacterState.Taking);
            this.item = newCell.character.item;
            newCell.character.item = null;
            newCell.character.operationDone = true;
            Cell.renderer?.updateCharacter(newCell.character);
            Cell.renderer?.updateCharacter(this);

            const duration = Math.max(100, (this.cell.level.game.speed || 1000) * 0.8);
            setTimeout(() => {
                if (this.state === CharacterState.Taking) {
                    this.setState(CharacterState.Idle);
                }
            }, duration);
            return;
        }
        // Printers are handled via pickup in a direction; take is worker-to-worker.
        this.stun();
    }

    pickupFrom(direction: Direction): boolean {
        this.actionDirection = direction;
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        if (!newCell) {
            this.stun();
            return false;
        }
        if (this.item) {
            this.stun();
            return false;
        }
        if (newCell instanceof Printer) {
            this.setState(CharacterState.Taking);
            this.item = newCell.printBox();
            Cell.renderer?.updateCharacter(this);

            const duration = Math.max(100, (this.cell.level.game.speed || 1000) * 0.8);
            setTimeout(() => {
                if (this.state === CharacterState.Taking) {
                    this.setState(CharacterState.Idle);
                }
            }, duration);
            return true;
        }
        const item = newCell.getItem();
        if (item && !item.destroyed) {
            this.setState(CharacterState.PickingUp);
            this.setItem(item);
            newCell.removeItem();
            Cell.renderer?.updateItem(newCell);

            const duration = Math.max(100, (this.cell.level.game.speed || 1000) * 0.8);
            setTimeout(() => {
                if (this.state === CharacterState.PickingUp) {
                    this.setState(CharacterState.Idle);
                }
            }, duration);
            return true;
        }
        this.stun();
        return false;
    }

    write(value: number) {
        if (!this.item || this.item.destroyed) {
            this.stun();
            return;
        }
        this.item.setValue(clampInt32(value));
        this.flashAction(CharacterState.Writing);
    }

    flashCalc(expression: string) {
        this.lastCalcText = expression;
        this.lastCalcUntil = Date.now() + 1500;
        this.flashAction(CharacterState.Calculating);
    }

    flashAction(state: CharacterState) {
        this.setState(state);
        const duration = Math.max(100, (this.cell.level.game.speed || 1000) * 0.8);
        setTimeout(() => {
            if (this.state === state) {
                this.setState(CharacterState.Idle);
            }
        }, duration);
    }

    pickupItem() {
        const item = this.cell.getItem();
        if (!this.item && item && !item.destroyed) {
            this.setState(CharacterState.PickingUp);
            this.setItem(item);
            this.cell.removeItem();

            // Fixed duration that scales with game speed but is not shorter than logic tick
            const duration = Math.max(100, (this.cell.level.game.speed || 1000) * 0.8);
            setTimeout(() => {
                if (this.state === CharacterState.PickingUp) {
                    this.setState(CharacterState.Idle);
                }
            }, duration);
        } else {
            this.stun();
        }
    }

    dropItem() {
        if (!this.item) {
            this.stun();
            return;
        }
        if (this.cell instanceof Hole) {
            // Cubes dropped into a hole fall down and disappear.
            this.setState(CharacterState.Dropping);
            this.item.destroy();
            this.item = null;
            Cell.renderer?.updateCharacter(this);

            const duration = Math.max(100, (this.cell.level.game.speed || 1000) * 0.8);
            setTimeout(() => {
                if (this.state === CharacterState.Dropping) {
                    this.setState(CharacterState.Idle);
                }
            }, duration);
            return;
        }
        if (!this.cell.getItem()) {
            this.setState(CharacterState.Dropping);
            this.cell.setItem(this.item);
            this.item = null;

            const duration = Math.max(100, (this.cell.level.game.speed || 1000) * 0.8);
            setTimeout(() => {
                if (this.state === CharacterState.Dropping) {
                    this.setState(CharacterState.Idle);
                }
            }, duration);
        } else {
            this.stun();
        }
    }

    getMoveCell(direction: Direction, prepare = false):Cell | undefined {
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        return newCell && newCell.isEmpty 
        && (newCell.getType() === CellType.Empty || newCell.getType() === CellType.Hole)
        && (prepare || !newCell.character) ? newCell : undefined;
    }

    say(text: string | undefined, direction: Direction | 'all') {
        if (text === undefined) {
            this.stun();
            return;
        }
        this.actionDirection = direction === 'all' ? null : direction;
        this.lastSaidText = text;
        this.lastSaidUntil = Date.now() + 1500;
        this.flashAction(CharacterState.Saying);
        if (direction === 'all') {
            this.cell.level.getCharacters().forEach(other => {
                if (other !== this && other.hear === text) {
                    other.hear = undefined;
                    other.currentLine++;
                    if (other.state === CharacterState.Listening) {
                        other.setState(CharacterState.Idle);
                    }
                    Cell.renderer?.updateCharacter(other);
                }
            });
            return;
        }
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        if (!newCell) {
            this.stun();
            return;
        }
        if (newCell.character && newCell.character.hear === text) {
            newCell.character.hear = undefined;
            newCell.character.currentLine++;
            if (newCell.character.state === CharacterState.Listening) {
                newCell.character.setState(CharacterState.Idle);
            }
            Cell.renderer?.updateCharacter(newCell.character);
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
