import { v4 as uuidv4 } from 'uuid';
import { Button } from '@mui/material';
import React from 'react';
import { LineType } from './types';
import { GameSerialized } from './Classes/Game';
import OperatorStep from './Classes/Operators/OperatorStep';
import { OperatorType } from './Classes/Operators/Operator';

const actions = [
    {
        type: OperatorType.Step,
    },
    // {
    //     type: 'give',
    //     add: (game:GameSerialized) => {
    //         newCode.push({ type: 'give', direction: { type: 'direction', value: 'left' }, id: uuidv4() });
    //     },
    // },
    // {
    //     type: 'take',
    //     add: (game:GameSerialized) => {
    //         newCode.push({ type: 'take', direction: { type: 'direction', value: 'left' }, id: uuidv4() });
    //     },
    // },
    {
        type: OperatorType.Goto,
    },
    {
        type: OperatorType.Pickup,
    },
    {
        type: OperatorType.Drop,
    },
    // },
    // {
    //     type: 'if',
    //     add: (game:GameSerialized) => {
    //         const id = uuidv4();
    //         newCode.push({
    //             type: 'if',
    //             conditions: [{
    //                 value1: { type: 'direction', value: 'here' },
    //                 operation: '==',
    //                 value2: { type: 'number', value: 0 },
    //                 logic: 'OR',
    //             }],
    //             id,
    //         }, { type: 'endif', ifId: id });
    //     },
    // },
    // {
    //     type: 'near',
    //     add: (game:GameSerialized) => {
    //         newCode.push({
    //             type: 'near', find: 'wall', slot: 1, id: uuidv4(),
    //         });
    //     },
    // },
    // {
    //     type: 'variable',
    //     add: (game:GameSerialized) => {
    //         newCode.push({
    //             type: 'variable',
    //             slot: 1,
    //             value: {
    //                 type: 'number',
    //                 value: 0,
    //             },
    //             id: uuidv4(),
    //         });
    //     },
    // },
    // {
    //     type: 'calc',
    //     add: (game:GameSerialized) => {
    //         newCode.push({
    //             type: 'calc',
    //             slot: 1,
    //             value1: {
    //                 type: 'number',
    //                 value: 0,
    //             },
    //             operation: '+',
    //             value2: {
    //                 type: 'number',
    //                 value: 0,
    //             },
    //             id: uuidv4(),
    //         });
    //     },
    // },
    // {
    //     type: 'say',
    //     add: (game:GameSerialized) => {
    //         newCode.push({
    //             type: 'say',
    //             text: 'hi',
    //             target: {
    //                 type: 'direction',
    //                 value: 'left',
    //             },
    //             id: uuidv4(),
    //         });
    //     },
    // },
    // {
    //     type: 'hear',
    //     add: (game:GameSerialized) => {
    //         newCode.push({
    //             type: 'hear', text: 'hi', id: uuidv4(),
    //         });
    //     },
    // },
    // {
    //     type: 'foreach',
    //     add: (game:GameSerialized) => {
    //         const id = uuidv4();
    //         newCode.push({
    //             type: 'foreach',
    //             directions: ['left'],
    //             slot: 1,
    //             id,
    //         }, { type: 'endforeach', foreachId: id });
    //     },
    // },
    // {
    //     type: 'end',
    //     add: (game:GameSerialized) => {
    //         newCode.push({ type: 'end' });
    //     },
    // },
    // {
    {
        type: OperatorType.Write,
    },
];

function AddPanel(props: {game: GameSerialized}) {
    return <>
        {actions.map(action => <div key={action.type}>
            <Button onClick={() => {
                props.game.object.addOperator(action.type, 0);
                props.game.object.render();
            }}
            >
                {`Add ${action.type}`}
            </Button>
        </div>)}
    </>;
}

export default AddPanel;
