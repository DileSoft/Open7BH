import { v4 as uuidv4 } from 'uuid';
import { Button } from '@mui/material';
import React from 'react';
import { LineType } from './types';

const actions = [
    {
        type: 'step',
        add: (newCode:LineType[]) => {
            newCode.push({
                type: 'step',
                destination: {
                    type: 'direction',
                    directions: ['left'],
                },
                id: uuidv4(),
            });
        },
    },
    {
        type: 'give',
        add: (newCode:LineType[]) => {
            newCode.push({ type: 'give', direction: 'left', id: uuidv4() });
        },
    },
    {
        type: 'take',
        add: (newCode:LineType[]) => {
            newCode.push({ type: 'take', direction: 'left', id: uuidv4() });
        },
    },
    {
        type: 'goto',
        add: (newCode:LineType[]) => {
            newCode.push({ type: 'goto', step: 0, id: uuidv4() });
        },
    },
    {
        type: 'pickup',
        add: (newCode:LineType[]) => {
            newCode.push({ type: 'pickup', id: uuidv4() });
        },
    },
    {
        type: 'drop',
        add: (newCode:LineType[]) => {
            newCode.push({ type: 'drop', id: uuidv4() });
        },
    },
    {
        type: 'if',
        add: (newCode:LineType[]) => {
            const id = uuidv4();
            newCode.push({
                type: 'if',
                conditions: [{
                    value1: { type: 'direction', value: 'here' },
                    operation: '==',
                    value2: { type: 'number', value: 0 },
                }],
                id,
            }, { type: 'endif', ifId: id });
        },
    },
    {
        type: 'near',
        add: (newCode:LineType[]) => {
            newCode.push({
                type: 'near', find: 'empty', slot: 1, id: uuidv4(),
            });
        },
    },
    {
        type: 'variable',
        add: (newCode:LineType[]) => {
            newCode.push({
                type: 'variable',
                slot: 1,
                value: {
                    type: 'number',
                    value: 0,
                },
                id: uuidv4(),
            });
        },
    },
    {
        type: 'say',
        add: (newCode:LineType[]) => {
            newCode.push({
                type: 'say',
                text: 'hi',
                target: {
                    type: 'direction',
                    value: 'left',
                },
                id: uuidv4(),
            });
        },
    },
    {
        type: 'hear',
        add: (newCode:LineType[]) => {
            newCode.push({
                type: 'hear', text: 'hi', id: uuidv4(),
            });
        },
    },
];

function AddPanel(props: {code: LineType[], setCode: React.Dispatch<React.SetStateAction<LineType[]>>}) {
    return <>
        {actions.map(action => <div key={action.type}>
            <Button onClick={() => {
                const newCode = [...props.code];
                action.add(newCode);
                props.setCode(newCode);
            }}
            >
                {`Add ${action.type}`}
            </Button>
        </div>)}
    </>;
}

export default AddPanel;
