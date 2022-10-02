import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    DirectionType, DirectionTypeWithHere, LineCalcType, RenderLineType, ValueDirectionType, ValueNumberType, ValueSlotType,
} from '../types';
import { clone, directionIcon } from '../Utils';

const calcRenderLine:RenderLineType<LineCalcType> = (line, lineNumber, code, setCode):React.ReactNode => <span>
Calc
    {' '}
    slot
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
    =
    <Select
        IconComponent={null}
        value={line.value1.type}
        onChange={e => {
            const newCode = clone(code);
            if (e.target.value === 'number') {
                newCode[lineNumber].value1 = { type: 'number', value: 0 };
            }
            if (e.target.value === 'myitem') {
                newCode[lineNumber].value1 = { type: 'myitem' };
            }
            if (e.target.value === 'direction') {
                newCode[lineNumber].value1 = { type: 'direction', value: 'left' };
            }
            if (e.target.value === 'slot') {
                newCode[lineNumber].value1 = { type: 'slot', slot: 1 };
            }
            setCode(newCode);
        }}
        variant="standard"
    >
        {['number', 'direction', 'slot', 'myitem'].map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.value1.type === 'number' &&
        <TextField
            type="number"
            value={line.value1.value}
            variant="standard"
            onChange={e => {
                const newCode = clone(code);
                (newCode[lineNumber].value1 as ValueNumberType).value = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />}
    {line.value1.type === 'direction' && <Select
        IconComponent={null}
        value={(line.value1 as ValueDirectionType).value}
        variant="standard"
        onChange={e => {
            const newCode = clone(code);
            (newCode[lineNumber].value1 as ValueDirectionType).value = e.target.value as DirectionTypeWithHere;
            setCode(newCode);
        }}
    >
        {['left', 'right', 'top', 'bottom', 'here', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((option:DirectionType) =>
            <MenuItem key={option} value={option}>
                {directionIcon(option)}
                {option}
            </MenuItem>)}
    </Select>}
    {line.value1.type === 'slot' &&
        <TextField
            type="number"
            value={line.value1.slot}
            variant="standard"
            onChange={e => {
                const newCode = clone(code);
                (newCode[lineNumber].value1 as ValueSlotType).slot = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />}

    <Select
        IconComponent={null}
        value={line.operation}
        variant="standard"
        onChange={e => {
            const newCode = clone(code);
            newCode[lineNumber].operation = e.target.value as any;
            setCode(newCode);
        }}
    >
        {['+', '-', '*', '/'].map(option =>
            <MenuItem key={option} value={option}>
                {option}
            </MenuItem>)}
    </Select>

    <Select
        IconComponent={null}
        value={line.value2.type}
        onChange={e => {
            const newCode = clone(code);
            if (e.target.value === 'number') {
                newCode[lineNumber].value2 = { type: 'number', value: 0 };
            }
            if (e.target.value === 'myitem') {
                newCode[lineNumber].value2 = { type: 'myitem' };
            }
            if (e.target.value === 'direction') {
                newCode[lineNumber].value2 = { type: 'direction', value: 'left' };
            }
            if (e.target.value === 'slot') {
                newCode[lineNumber].value2 = { type: 'slot', slot: 1 };
            }
            setCode(newCode);
        }}
        variant="standard"
    >
        {['number', 'direction', 'slot', 'myitem'].map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.value2.type === 'number' &&
        <TextField
            type="number"
            value={line.value2.value}
            variant="standard"
            onChange={e => {
                const newCode = clone(code);
                (newCode[lineNumber].value2 as ValueNumberType).value = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />}
    {line.value2.type === 'direction' && <Select
        IconComponent={null}
        value={(line.value2 as ValueDirectionType).value}
        variant="standard"
        onChange={e => {
            const newCode = clone(code);
            (newCode[lineNumber].value2 as ValueDirectionType).value = e.target.value as DirectionTypeWithHere;
            setCode(newCode);
        }}
    >
        {['left', 'right', 'top', 'bottom', 'here', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((option:DirectionType) =>
            <MenuItem key={option} value={option}>
                {directionIcon(option)}
                {option}
            </MenuItem>)}
    </Select>}
    {line.value2.type === 'slot' &&
        <TextField
            type="number"
            value={line.value2.slot}
            variant="standard"
            onChange={e => {
                const newCode = clone(code);
                (newCode[lineNumber].value2 as ValueSlotType).slot = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />}
</span>;

export default calcRenderLine;
