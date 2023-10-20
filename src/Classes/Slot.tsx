import Cell from './Cell';
import Character from './Character';

abstract class Slot {
    character: Character;

    constructor(character: Character) {
        this.character = character;
    }

    getNumberValue(): number {
        return 0;
    }

    getCellValue(): Cell | undefined {
        return undefined;
    }

    getCharacterValue(): Character | undefined {
        return undefined;
    }
}

export default Slot;
