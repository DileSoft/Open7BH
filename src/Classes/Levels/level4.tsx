import { GameSerialized } from '../Game';
import Level, { LevelSerializedType } from '../Level';

const level:GameSerialized = {
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
        winCallback: (level: Level) => [0, 1, 2, 3, 4].every(number => level.cells[`${number}x${number + 1}`].item),
    },
    code: ([
    ]),
};

export default level;
