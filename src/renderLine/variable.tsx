import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    DirectionType, DirectionTypeWithHere, LineVariableType, RenderLineType, ValueDirectionType, ValueNumberType, ValueSlotType,
} from '../types';
import { clone, directionIcon } from '../Utils';

const variableRenderLine:RenderLineType<LineVariableType> = (line, lineNumber, code, setCode):React.ReactNode => <span>
Variable
    {' '}
    <TextField
        type="number"
        value={line.slot}
        variant="standard"
        onChange={e => {
            const newCode = clone(code);
            newCode[lineNumber].slot = parseInt(e.target.value) || 0;
            setCode(newCode);
        }}
    />
    <Select
        IconComponent={null}
        value={line.value.type}
        onChange={e => {
            const newCode = clone(code);
            if (e.target.value === 'number') {
                newCode[lineNumber].value = { type: 'number', value: 0 };
            }
            if (e.target.value === 'myitem') {
                newCode[lineNumber].value = { type: 'myitem' };
            }
            if (e.target.value === 'direction') {
                newCode[lineNumber].value = { type: 'direction', value: 'left' };
            }
            if (e.target.value === 'slot') {
                newCode[lineNumber].value = { type: 'slot', slot: 1 };
            }
            setCode(newCode);
        }}
        variant="standard"
    >
        {['number', 'direction', 'slot', 'myitem'].map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.value.type === 'number' &&
        <TextField
            type="number"
            value={line.value.value}
            variant="standard"
            onChange={e => {
                const newCode = clone(code);
                (newCode[lineNumber].value as ValueNumberType).value = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />}
    {line.value.type === 'direction' && <Select
        IconComponent={null}
        value={(line.value as ValueDirectionType).value}
        variant="standard"
        onChange={e => {
            const newCode = clone(code);
            (newCode[lineNumber].value as ValueDirectionType).value = e.target.value as DirectionTypeWithHere;
            setCode(newCode);
        }}
    >
        {['left', 'right', 'top', 'bottom', 'here', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((option:DirectionType) =>
            <MenuItem key={option} value={option}>
                {directionIcon(option)}
                {option}
            </MenuItem>)}
    </Select>}
    {line.value.type === 'slot' &&
        <TextField
            type="number"
            value={line.value.slot}
            variant="standard"
            onChange={e => {
                const newCode = clone(code);
                (newCode[lineNumber].value as ValueSlotType).slot = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />}
</span>;

export default variableRenderLine;
