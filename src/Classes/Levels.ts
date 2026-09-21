import { serialize, deserialize } from 'serialize-anything';

import { GameSerialized } from './Game';
import levelList from '../levelsList';

const META_KEY = 'open7bh-levels-meta';

export interface LevelMeta {
    isSystem: boolean;
    /** True when the user saved an edited version of a system level. */
    modified: boolean;
}

/**
 * Browser persistence for levels.
 *
 * The raw level data lives in localStorage under the legacy `levels` key
 * (an array of GameSerialized — unchanged for backwards compatibility).
 * Provenance (system/user/modified) is stored separately under
 * `open7bh-levels-meta` so old saves keep working untouched.
 */
class Levels {
    static preloadLevels(): void {
        levelList.forEach(systemLevel => {
            const stored = this.getLevels().find(level => level.name === systemLevel.name);
            const meta = this.getMeta(systemLevel.name);
            // Keep a user-modified version of a system level as-is.
            if (stored && meta && meta.modified) {
                return;
            }
            this.save(systemLevel.name, systemLevel);
            this.setMeta(systemLevel.name, { isSystem: true, modified: false });
        });
    }

    static getLevels(): GameSerialized[] {
        const data = localStorage.getItem('levels');
        if (data) {
            try {
                return deserialize(data);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    static setLevels(levels: GameSerialized[]) {
        localStorage.setItem('levels', serialize(levels));
    }

    static save(name:string, data: GameSerialized): void;

    static save(name:number, data: GameSerialized): void;

    static save(name:string | number, data: GameSerialized): void {
        const levels = this.getLevels();
        let index: number;
        if (typeof name === 'string') {
            index = levels.findIndex(level => level.name === name);
        } else {
            index = name;
        }
        if (index === -1) {
            levels.push(data);
        } else {
            levels[index] = data;
        }
        this.setLevels(levels);
    }

    /**
     * Save the level currently open in the editor as a user-level entry:
     * system levels are kept as "modified", new names are stored as user levels.
     */
    static saveUserLevel(data: GameSerialized): void {
        this.save(data.name, data);
        const isSystem = this.isSystemName(data.name);
        this.setMeta(data.name, { isSystem, modified: isSystem });
    }

    /** Restore a modified system level back to the pristine built-in version. */
    static restoreOriginal(name: string): void {
        const original = levelList.find(level => level.name === name);
        if (!original) return;
        this.save(name, original);
        this.setMeta(name, { isSystem: true, modified: false });
    }

    static load(name:string): GameSerialized;

    static load(name:number): GameSerialized;

    static load(name:string | number): GameSerialized {
        const data = Levels.getLevels();
        if (typeof name === 'string') {
            return data.find(level => level.name === name);
        }
        return data[name];
    }

    static remove(name:string) {
        const data = Levels.getLevels();
        const index = data.findIndex(level => level.name === name);
        if (index !== -1) {
            data.splice(index, 1);
            Levels.setLevels(data);
            Levels.deleteMeta(name);
        }
    }

    static isSystemName(name: string): boolean {
        return levelList.some(level => level.name === name);
    }

    static getMeta(name: string): LevelMeta | undefined {
        try {
            const raw = localStorage.getItem(META_KEY);
            if (!raw) return undefined;
            const parsed = JSON.parse(raw) as Record<string, LevelMeta>;
            const meta = parsed[name];
            if (!meta) return undefined;
            return {
                isSystem: !!meta.isSystem,
                modified: !!meta.modified,
            };
        } catch (e) {
            return undefined;
        }
    }

    static setMeta(name: string, meta: LevelMeta): void {
        try {
            const raw = localStorage.getItem(META_KEY);
            const parsed = raw ? JSON.parse(raw) as Record<string, LevelMeta> : {};
            parsed[name] = { isSystem: !!meta.isSystem, modified: !!meta.modified };
            localStorage.setItem(META_KEY, JSON.stringify(parsed));
        } catch (e) {
            // ignore storage errors
        }
    }

    static deleteMeta(name: string): void {
        try {
            const raw = localStorage.getItem(META_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as Record<string, LevelMeta>;
            if (parsed[name]) {
                delete parsed[name];
                localStorage.setItem(META_KEY, JSON.stringify(parsed));
            }
        } catch (e) {
            // ignore storage errors
        }
    }
}

export default Levels;