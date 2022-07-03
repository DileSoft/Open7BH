import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    DirectionType, LineStepType, RenderLineType, StepDirection, ValueSlotType,
} from '../types';
import { clone, directionIcon } from '../Utils';

const stepRenderLine:RenderLineType<LineStepType> = (line, lineNumber, code, setCode):React.ReactNode => <span>
Step:
    {' '}
    <Select
        IconComponent={null}
        value={line.destination.type}
        onChange={e => {
            const newCode = clone(code);
            if (e.target.value === 'direction') {
                newCode[lineNumber].destination = {
                    type: 'direction',
                    directions: ['left'],
                };
            }
            if (e.target.value === 'slot') {
                newCode[lineNumber].destination = {
                    type: 'slot',
                    slot: 1,
                };
            }
            setCode(newCode);
        }}
        variant="standard"
    >
        {['direction', 'slot'].map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.destination.type === 'direction' &&
    <Select
        IconComponent={null}
        value={(line.destination as StepDirection).directions}
        variant="standard"
        multiple
        onChange={e => {
            const newCode = clone(code);
            (newCode[lineNumber].destination as StepDirection).directions = e.target.value as DirectionType[];
            setCode(newCode);
        }}
    >
        {['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((direction:DirectionType) =>
            <MenuItem key={direction} value={direction}>
                {directionIcon(direction)}
                {direction}
            </MenuItem>)}
    </Select>}
    {line.destination.type === 'slot' &&
        <TextField
            type="number"
            value={line.destination.slot}
            variant="standard"
            onChange={e => {
                const newCode = clone(code);
                (newCode[lineNumber].destination as ValueSlotType).slot = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />}
</span>;

export default stepRenderLine;
