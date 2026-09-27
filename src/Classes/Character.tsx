import Box, { clampInt32 } from './Box';
import Cell, { CellType } from './Cell';
import NumberSlot from './NumberSlot';
import { Direction } from './Operators/OperatorStep';
import Printer from './Printer';
import Shredder from './Shredder';
import Hole from './Hole';
import Slot from './Slot';
import i18n from '../i18n';

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

/** Outcome of a single step attempt. */
export enum StepStatus {
    /** The worker changed tiles (stepped or swapped with another worker). */
    Moved = 'moved',
    /** The destination is occupied by another worker; retry later. */
    Blocked = 'blocked',
    /** Wall / edge / appliance: the step has no effect and the command completes. */
    NoEffect = 'noEffect',
}

/** Outcome of a single pathfinding step toward a target cell. */
type StepTowardResult = 'arrived' | 'moving' | 'blocked' | 'noPath';

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

    /** Direction of the step the worker is (still) trying to make, for head-on swaps. */
    stepIntent?: Direction;

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

    /** Set when the pending step was already satisfied by a head-on swap. */
    private pendingStepDone = false;

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
    stun(durationMs = STUN_DURATION_MS, reason?: string) {
        this.stunnedUntil = Date.now() + durationMs;
        this.setState(CharacterState.Stunned);
        if (reason) {
            this.lastSaidText = reason;
            this.lastSaidUntil = Date.now() + durationMs;
        }
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
        // A head-on swap already fulfilled the pending step: count it as done.
        if (this.pendingStepDone) {
            this.pendingStepDone = false;
            this.stepIntent = undefined;
            const code = this.cell.level.game.code;
            this.currentLine++;
            if (this.currentLine >= code.length) {
                this.isTerminated = true;
            }
            return;
        }
        // A new command is starting: any previous step intent is stale.
        this.stepIntent = undefined;
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

    /** Try a single step. */
    step(direction: Direction): StepStatus {
        this.actionDirection = direction;
        this.stepIntent = direction;
        const target = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        if (!target) {
            // Edge of the room counts as a wall: soft exception, no effect.
            this.stun(STUN_DURATION_MS, i18n.t('stun.wall'));
            return StepStatus.NoEffect;
        }
        if (target.getType() === CellType.Wall) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.wall'));
            return StepStatus.NoEffect;
        }
        if (target.getType() === CellType.Hole) {
            // Stepping into a hole kills the worker.
            this.cell.character = null;
            this.cell = target;
            target.character = this;
            Cell.renderer?.updateCharacter(this);
            this.die();
            return StepStatus.NoEffect;
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

            this.stepIntent = undefined;
            Cell.renderer?.updateCharacter(this);
            return StepStatus.Moved;
        }
        // Occupied by another worker: swap when walking head-on, or when the
        // occupant has finished its program and politely yields.
        const other = target.character;
        if (other && other !== this && (other.isTerminated || this.faces(other))) {
            this.swapCells(other);
            return StepStatus.Moved;
        }
        // Otherwise wait: soft exception "blocked" and retry the same command.
        this.stun(STUN_DURATION_MS, i18n.t('stun.blocked'));
        return StepStatus.Blocked;
    }

    /** True when `other` is trying to step into this worker's tile. */
    private faces(other: Character): boolean {
        if (!other.stepIntent) {
            return false;
        }
        const direction = other.directionTo(this.cell.x, this.cell.y);
        return direction !== undefined && direction === other.stepIntent;
    }

    /** Exchange tiles with another worker (head-on pass). */
    private swapCells(other: Character) {
        const myCell = this.cell;
        const otherCell = other.cell;

        myCell.character = null;
        otherCell.character = null;

        this.cell = otherCell;
        otherCell.character = this;
        other.cell = myCell;
        myCell.character = other;

        this.targetCell = otherCell;
        other.targetCell = myCell;
        this.stepIntent = undefined;
        other.stepIntent = undefined;
        this.state = CharacterState.Moving;
        other.state = CharacterState.Moving;

        // The other worker already returned "blocked" for its step (or will be
        // skipped while moving), so mark that step as fulfilled by the swap —
        // otherwise it would step one extra tile on the next tick.
        if (!other.isTerminated) {
            other.pendingStepDone = true;
        }

        Cell.renderer?.updateCharacter(this);
        Cell.renderer?.updateCharacter(other);
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

    /**
     * Walk to the recipient referenced by a memory slot and give the held cube.
     * Returns true when the command is finished (given or failed), false while travelling.
     */
    giveToSlot(slotIndex: number): boolean {
        const target = this.resolveSlotCell(slotIndex);
        if (!target) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noTarget'));
            return true;
        }
        if (target === this.cell) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.tooFar'));
            return true;
        }
        const direction = this.directionTo(target.x, target.y);
        if (direction) {
            this.giveItem(direction);
            return true;
        }
        const result = this.stepToward(target);
        if (result === 'noPath' || result === 'arrived') {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noPath'));
            return true;
        }
        return false;
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
            this.stun(STUN_DURATION_MS, i18n.t('stun.noPath'));
            return;
        }
        // Falling into a shredder or hole kills the worker even without an item.
        if (newCell instanceof Shredder) {
            if (this.item) {
                this.setState(CharacterState.Giving);
                this.item.destroy();
                newCell.shred();
                this.item = null;
                Cell.renderer?.updateCharacter(this);

                const duration = Math.max(100, (this.cell.level.game.speed || 1000) * 0.8);
                setTimeout(() => {
                    if (this.state === CharacterState.Giving) {
                        this.setState(CharacterState.Idle);
                    }
                }, duration);
            } else {
                // No item — worker falls into the shredder and dies.
                this.cell.character = null;
                this.cell = newCell;
                newCell.character = this;
                Cell.renderer?.updateCharacter(this);
                this.die();
            }
            return;
        }
        if (newCell instanceof Hole) {
            if (this.item) {
                // Dropping a cube into a hole destroys it.
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
            } else {
                // No item — worker falls into the hole and dies.
                this.cell.character = null;
                this.cell = newCell;
                newCell.character = this;
                Cell.renderer?.updateCharacter(this);
                this.die();
            }
            return;
        }
        if (!this.item) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.nothingToGive'));
            return;
        }
        if (newCell.character) {
            this.setState(CharacterState.Giving);
            // Give our item; if the receiver already holds one, swap instead.
            const received = newCell.character.item;
            newCell.character.setItem(this.item);
            newCell.character.operationDone = true;
            this.setItem(received);

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
        this.stun(STUN_DURATION_MS, i18n.t('stun.cantGive'));
    }

    take(direction: Direction):void {
        this.actionDirection = direction;
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        if (!newCell) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noPath'));
            return;
        }
        if (this.item) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.alreadyHolding'));
            return;
        }
        // Take a box from a neighbouring worker.
        if (newCell.character?.item) {
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
        // Take a box from a printer (prints a new box on demand).
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
            return;
        }
        this.stun(STUN_DURATION_MS, i18n.t('stun.nothingToTake'));
    }

    /**
     * Walk to the worker/printer referenced by a memory slot and take a cube from it.
     * Returns true when the command is finished, false while travelling.
     */
    takeFromSlot(slotIndex: number): boolean {
        if (this.item) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.alreadyHolding'));
            return true;
        }
        const target = this.resolveSlotCell(slotIndex);
        if (!target) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noTarget'));
            return true;
        }
        const direction = this.directionTo(target.x, target.y);
        if (direction) {
            this.take(direction);
            return true;
        }
        const result = this.stepToward(target);
        if (result === 'noPath' || result === 'arrived') {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noTarget'));
            return true;
        }
        return false;
    }

    pickupFrom(direction: Direction): boolean {
        this.actionDirection = direction;
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        if (!newCell) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noPath'));
            return false;
        }
        if (this.item) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.alreadyHolding'));
            return false;
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
        this.stun(STUN_DURATION_MS, i18n.t('stun.nothingHere'));
        return false;
    }

    /**
     * Walk to a cube referenced by a memory slot and pick it up.
     * Returns true when the command is finished, false while travelling.
     */
    pickupFromSlot(slotIndex: number): boolean {
        if (this.item) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.alreadyHolding'));
            return true;
        }
        const target = this.resolveSlotCell(slotIndex);
        if (!target) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noTarget'));
            return true;
        }
        if (target === this.cell) {
            this.pickupItem();
            return true;
        }
        // Pickup by reference walks all the way onto the cube's tile, then picks up.
        const result = this.stepToward(target);
        if (result === 'noPath') {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noPath'));
            return true;
        }
        return false;
    }

    write(value: number) {
        if (!this.item || this.item.destroyed) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noBox'));
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
            this.stun(STUN_DURATION_MS, i18n.t('stun.nothingHere'));
        }
    }

    dropItem() {
        if (!this.item) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noBox'));
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
            this.stun(STUN_DURATION_MS, i18n.t('stun.cellOccupied'));
        }
    }

    /**
     * Take one step along the shortest path to the target cell.
     * - 'arrived' — already standing on the target;
     * - 'moving'  — a step was taken;
     * - 'blocked' — the next tile is occupied (the step already complained);
     * - 'noPath'  — the target cannot be reached.
     */
    private stepToward(target: Cell): StepTowardResult {
        if (target === this.cell) {
            return 'arrived';
        }
        const path = this.cell.level.findNear(
            [this.cell.x, this.cell.y],
            cell => cell === target,
        );
        if (path.length > 1 && path[1]) {
            const direction = this.directionTo(path[1].x, path[1].y);
            if (direction) {
                const status = this.step(direction);
                if (status === StepStatus.Moved) return 'moving';
                if (status === StepStatus.Blocked) return 'blocked';
                return 'noPath';
            }
        }
        return 'noPath';
    }

    /**
     * Walk to the cell referenced by a memory slot (`step memX`).
     * Returns true when the command is finished, false while travelling.
     */
    stepToSlot(slotIndex: number): boolean {
        const target = this.resolveSlotCell(slotIndex);
        if (!target) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noTarget'));
            return true;
        }
        const result = this.stepToward(target);
        if (result === 'arrived') {
            return true;
        }
        if (result === 'noPath') {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noPath'));
            return true;
        }
        return false;
    }

    getMoveCell(direction: Direction, prepare = false):Cell | undefined {
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        return newCell && newCell.isEmpty 
        && (newCell.getType() === CellType.Empty || newCell.getType() === CellType.Hole)
        && (prepare || !newCell.character) ? newCell : undefined;
    }

    /** Wake a worker that is listening for exactly this message. */
    private wakeListener(target: Character, text: string) {
        if (target.hear !== text) {
            return;
        }
        target.hear = undefined;
        target.currentLine++;
        if (target.state === CharacterState.Listening) {
            target.setState(CharacterState.Idle);
        }
        Cell.renderer?.updateCharacter(target);
    }

    say(text: string | undefined, direction: Direction | 'all') {
        if (text === undefined) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noMessage'));
            return;
        }
        this.actionDirection = direction === 'all' ? null : direction;
        this.lastSaidText = text;
        this.lastSaidUntil = Date.now() + 1500;
        this.flashAction(CharacterState.Saying);
        if (direction === 'all') {
            this.cell.level.getCharacters().forEach(other => {
                if (other !== this) {
                    this.wakeListener(other, text);
                }
            });
            return;
        }
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        if (!newCell) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noPath'));
            return;
        }
        if (newCell.character) {
            this.wakeListener(newCell.character, text);
        }
    }

    /** Tell a message to the worker referenced by a memory slot. */
    sayToSlot(slotIndex: number, text?: string) {
        if (text === undefined) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noMessage'));
            return;
        }
        const target = this.slots[slotIndex]?.getCharacterValue()
            ?? this.resolveSlotCell(slotIndex)?.character;
        if (!target) {
            this.stun(STUN_DURATION_MS, i18n.t('stun.noTarget'));
            return;
        }
        this.actionDirection = null;
        this.lastSaidText = text;
        this.lastSaidUntil = Date.now() + 1500;
        this.flashAction(CharacterState.Saying);
        this.wakeListener(target, text);
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
