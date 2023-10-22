import Level, { LevelSerializedType } from '../Level';
import Shredder from '../Shredder';

const level:LevelSerializedType = {
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
    // code: ([
    // ]),
    winCallback: (level: Level) => (level.cells['2x2'] as Shredder).shredded >= 10,
};

export default level;
