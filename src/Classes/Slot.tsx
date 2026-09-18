import Cell from './Cell';
import Character from './Character';
import Box from './Box';

/* eslint-disable class-methods-use-this */
abstract class Slot {
    character: Character;

    constructor(character: Character) {
        this.character = character;
    }

    isNothing(): boolean {
        return false;
    }

    getNumberValue(): number | undefined {
        return 0;
    }

    getBox(): Box | undefined {
        return undefined;
    }

    getCellValue(): Cell | undefined {
        return undefined;
    }

    getCharacterValue(): Character | undefined {
        return undefined;
    }
}

export default Slot;
