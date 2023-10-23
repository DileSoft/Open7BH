import { GameSerialized } from '../Game';
import Level, { LevelSerializedType } from '../Level';

const level:GameSerialized = {
    level: {
        task: 'Remove only box with 2',
        width: 5,
        height: 7,
        cells: Level.parseCells(
            `empty empty empty empty empty
box|2|tag2 box|1|tag1 wall empty empty
empty empty wall empty empty
empty empty empty empty empty
empty empty empty empty empty
hole hole
hole hole`,
            [
                {
                    coordinates: [0, 0], name: 'first', color: 'red',
                },
                {
                    coordinates: [1, 0], name: 'second', color: 'green',
                },
            ],
        ),
        winCallback: (level:Level) => (
            Object.values(level.cells).find(cell => cell.item?.tag === 'tag1') ||
         level.getCharacters().find(character => character.item?.tag === 'tag1')) &&
    !(Object.values(level.cells).find(cell => cell.item?.tag === 'tag2')
    || level.getCharacters().find(character => !character.isTerminated && character.item?.tag === 'tag2')),
    },
    code: ([
    //     { type: 'step', destination: { type: 'direction', directions: ['bottom'] } },
    //     {
    //         type: 'if',
    //         conditions: [{
    //             value1: { type: 'direction', value: 'here' }, operation: '>', value2: { type: 'number', value: 1 }, logic: 'OR',
    //         }],
    //         id: 'if1',
    //     },
    //     { type: 'pickup' },
    //     { type: 'endif', ifId: 'if1' },
    //     { type: 'goto', step: 0 },
    ]),
};

export default level;
