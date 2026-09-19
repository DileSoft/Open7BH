import { GameSerialized } from '../Game';
import Level, { LevelSerializedType } from '../Level';
import Shredder from '../Shredder';

const level:GameSerialized = {
    name: 'Print and shred (no move)',
    translations: {
        task: { en: 'Print and shred 10 boxes (no move)', ru: 'Напечатать и уничтожить 10 ящиков (без движения)' },
        characterNames: { '1': { en: '1', ru: '1' }, '2': { en: '2', ru: '2' }, '3': { en: '3', ru: '3' }, '4': { en: '4', ru: '4' }, '5': { en: '5', ru: '5' } },
    },
    level: {
        task: 'Print and shred 10 boxes (no move)',
        width: 7,
        height: 5,
        cells: Level.parseCells(
            `hole hole hole hole hole hole hole
hole empty empty empty empty empty hole
hole printer hole hole hole shredder hole
hole hole hole hole hole hole hole
hole hole hole hole hole hole hole`,
            [
                {
                    coordinates: [1, 1], name: '1', color: 'purple',
                },
                {
                    coordinates: [2, 1], name: '2', color: 'red',
                },
                {
                    coordinates: [3, 1], name: '3', color: 'green',
                },
                {
                    coordinates: [4, 1], name: '4', color: 'yellow',
                },
                {
                    coordinates: [5, 1], name: '5', color: 'blue',
                },
            ],
        ),
        winCallback: (level: Level) => (level.cells['5x2'] as Shredder).shredded >= 10,
    },
    code: ([
    ]),
};

export default level;
