import { GameSerialized } from '../Game';
import Level from '../Level';

const level:GameSerialized = {
    name: 'Print and shred',
    translations: {
        task: { en: 'Print and shred 10 boxes', ru: 'Напечатать и уничтожить 10 ящиков' },
        characterNames: { first: { en: 'first', ru: 'первый' }, second: { en: 'second', ru: 'второй' } },
    },
    level: {
        task: 'Print and shred 10 boxes',
        width: 5,
        height: 5,
        cells: Level.parseCells(
            `empty empty empty empty empty
empty empty empty empty empty
empty printer shredder empty empty
empty empty empty empty empty
empty empty empty empty empty`,
            [
                {
                    coordinates: [1, 1], name: 'first', color: 'red',
                },
                {
                    coordinates: [2, 1], name: 'second', color: 'green',
                },
            ],
        ),
        winConditions: {
            mode: 'all',
            conditions: [
                { kind: 'shredded', coordinates: [2, 2], operator: 'ge', value: 10 },
            ],
        },
    },
    code: ([
    ]),
};

export default level;
