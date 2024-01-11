import { serialize, deserialize } from 'serialize-anything';

import { GameSerialized } from './Game';
import levelList from '../levelsList';

class Levels {
    static preloadLevels(): void {
        levelList.forEach(level => {
            if (!Levels.load(level.name)) {
                Levels.save(level.name, level);
            }
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
        }
    }
}

export default Levels;
