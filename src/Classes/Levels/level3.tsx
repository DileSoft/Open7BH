import { GameSerialized } from '../Game';
import Level from '../Level';

const level:GameSerialized = {
    name: 'Remove only box with 2',
    translations: {
        task: { en: 'Remove only box with 2', ru: 'Убрать только ящик с 2' },
        characterNames: { first: { en: 'first', ru: 'первый' }, second: { en: 'second', ru: 'второй' } },
    },
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
        winConditions: {
            mode: 'all',
            conditions: [
                { kind: 'tagPresent', tag: 'tag1' },
                { kind: 'tagAbsent', tag: 'tag2' },
            ],
        },
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
