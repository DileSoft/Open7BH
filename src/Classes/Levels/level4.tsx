import { GameSerialized } from '../Game';
import Level, { LevelSerializedType } from '../Level';

const level:GameSerialized = {
    name: 'Diagonal boxes',
    translations: {
        task: { en: 'Diagonal boxes', ru: 'Диагональные ящики' },
        characterNames: { first: { en: 'first', ru: 'первый' }, second: { en: 'second', ru: 'второй' }, '3': { en: '3', ru: '3' }, '4': { en: '4', ru: '4' } },
    },
    level: {
        task: 'Diagonal boxes',
        width: 5,
        height: 7,
        cells: Level.parseCells(
            `empty empty empty empty empty
box|1 box|1 box|1 box|1 box|1
empty empty empty empty empty
empty empty empty empty empty
empty empty empty empty empty
empty empty empty empty empty
empty empty empty empty empty`,
            [
                {
                    coordinates: [1, 1], name: 'first', color: 'red',
                },
                {
                    coordinates: [2, 1], name: 'second', color: 'green',
                },
                {
                    coordinates: [3, 1], name: '3', color: 'yellow',
                },
                {
                    coordinates: [4, 1], name: '4', color: 'blue',
                },
            ],
        ),
        winConditions: {
            mode: 'all',
            conditions: [
                { kind: 'cellsHaveItems', coordinates: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
            ],
        },
    },
    code: ([
    ]),
};

export default level;
