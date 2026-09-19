import { GameSerialized, LevelTranslations } from './Classes/Game';
import { LEVEL_TRANSLATIONS } from './levelsList';
import i18n from './i18n';

export function getLevelTranslations(name: string): LevelTranslations | undefined {
    return LEVEL_TRANSLATIONS[name];
}

export function getLevelTask(level: GameSerialized): string {
    const tr = LEVEL_TRANSLATIONS[level.name];
    if (tr) {
        const lang = i18n.language as 'en' | 'ru';
        return tr.task[lang] || level.level.task;
    }
    return level.level.task;
}

export function getCharacterName(name: string, levelName?: string): string {
    if (levelName) {
        const tr = LEVEL_TRANSLATIONS[levelName];
        if (tr?.characterNames?.[name]) {
            const lang = i18n.language as 'en' | 'ru';
            return tr.characterNames[name][lang] || name;
        }
    }
    return name;
}
