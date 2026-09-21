import level1 from './Classes/Levels/level1';
import level2 from './Classes/Levels/level2';
import level3 from './Classes/Levels/level3';
import level4 from './Classes/Levels/level4';
import level5 from './Classes/Levels/level5';
import level6 from './Classes/Levels/level6';
import level7 from './Classes/Levels/level7';
import level8 from './Classes/Levels/level8.json';
import { GameSerialized, LevelTranslations } from './Classes/Game';
import { LevelJsonFormat, parseLevelJson } from './levelJson';

// Adding a level exported from the editor as JSON:
//   1. save/download the level from the Editor ("Download JSON") into src/Classes/Levels/levelN.json
//   2. add an import above and append `parseLevelJson(levelN)` to the list below.
// The editor's "Save" button it not needed for source levels — the JSON file IS the source.
const levels:GameSerialized[] = [level1,
    level2,
    level3,
    level4,
    level5,
    level6,
    level7,
    parseLevelJson(level8 as unknown as LevelJsonFormat),
];

// Translations registry — always read from source files, never serialized to localStorage
export const LEVEL_TRANSLATIONS: Record<string, LevelTranslations> = {};
levels.forEach(level => {
    if (level.translations) {
        LEVEL_TRANSLATIONS[level.name] = level.translations;
    }
});

export default levels;