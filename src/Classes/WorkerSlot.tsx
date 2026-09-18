import Character from './Character';
import Slot from './Slot';
import Box from './Box';

/**
 * Reference to a worker: reads the cube currently held by that worker.
 * Becomes nothing if the worker holds nothing.
 */
class WorkerSlot extends Slot {
    worker?: Character;

    setWorker(worker?: Character) {
        this.worker = worker;
    }

    getCharacterValue(): Character | undefined {
        return this.worker;
    }

    isNothing(): boolean {
        return !this.worker;
    }

    getBox(): Box | undefined {
        const item = this.worker?.item;
        if (!item || item.destroyed) return undefined;
        return item;
    }

    getNumberValue(): number | undefined {
        const item = this.worker?.item;
        if (!item || item.destroyed) return undefined;
        return item.value;
    }
}

export default WorkerSlot;
