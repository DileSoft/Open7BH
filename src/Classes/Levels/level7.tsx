import { GameSerialized } from '../Game';
import Level, { LevelSerializedType } from '../Level';
import Shredder from '../Shredder';

const level:GameSerialized = {
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
