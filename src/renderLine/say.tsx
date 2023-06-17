import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    DirectionType, LineSayType, RenderLineType, ValueDirectionType, ValueSlotType,
} from '../types';
import { clone, directionIcon } from '../Utils';

const sayRenderLine:RenderLineType<LineSayType> = (line, lineNumber, code, setCode):React.ReactNode => <span>
    Say:
    {' '}
    <TextField
        value={line.text}
        variant="standard"
        onChange={e => {
            const newCode = clone(code);
            newCode[lineNumber].text = e.target.value;
            setCode(newCode);
        }}
    />
    <Select
        IconComponent={null}
        value={line.target.type}
        onChange={e => {
            const newCode = clone(code);
            if (e.target.value === 'direction') {
                newCode[lineNumber].target = {
                    type: 'direction',
                    value: 'left',
                };
            }
            if (e.target.value === 'slot') {
                newCode[lineNumber].target = {
                    type: 'slot',
                    slot: 1,
                };
            }
            if (e.target.value === 'all') {
                newCode[lineNumber].target = {
                    type: 'all',
                };
            }
            setCode(newCode);
        }}
        variant="standard"
    >
        {['direction', 'all', 'slot'].map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.target.type === 'direction' && <Select
        IconComponent={null}
        value={(line.target as ValueDirectionType).value}
        variant="standard"
        onChange={e => {
            const newCode = clone(code);
            (newCode[lineNumber].target as ValueDirectionType).value = e.target.value as DirectionType;
            setCode(newCode);
        }}
    >
        {['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((direction:DirectionType) =>
            <MenuItem key={direction} value={direction}>
                {directionIcon(direction)}
                {direction}
            </MenuItem>)}
    </Select>}
    {line.target.type === 'slot' &&
        <TextField
            type="number"
            value={line.target.slot}
            variant="standard"
            onChange={e => {
                const newCode = clone(code);
                (newCode[lineNumber].target as ValueSlotType).slot = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />}
</span>;

export default sayRenderLine;
