import {
    IconButton, MenuItem, Select, TextField,
} from '@mui/material';
import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import {
    DirectionType, DirectionTypeWithHere, IfOperationType, LineIfType, RenderLineType, ValueDirectionType, ValueNumberType, ValueSlotType,
} from '../types';
import { clone, directionIcon } from '../Utils';

const ifRenderLine:RenderLineType<LineIfType> = (line, lineNumber, code, setCode):React.ReactNode => <span>
If:
    {' '}
    {line.conditions.map((condition, conditionKey) => <span key={conditionKey}>
        <Select
            IconComponent={null}
            value={condition.logic}
            variant="standard"
            onChange={e => {
                const newCode = clone(code) as LineIfType[];
                newCode[lineNumber].conditions[conditionKey].logic = e.target.value as any;
                setCode(newCode);
            }}
        >
            {['OR', 'AND'].map(option =>
                <MenuItem key={option} value={option}>
                    {option}
                </MenuItem>)}
        </Select>
        <Select
            IconComponent={null}
            value={condition.value1.type}
            onChange={e => {
                const newCode = clone(code);
                if (e.target.value === 'myitem') {
                    newCode[lineNumber].conditions[conditionKey].value1 = { type: 'myitem' };
                }
                if (e.target.value === 'direction') {
                    newCode[lineNumber].conditions[conditionKey].value1 = { type: 'direction', value: 'left' };
                }
                if (e.target.value === 'slot') {
                    newCode[lineNumber].conditions[conditionKey].value1 = { type: 'slot', slot: 1 };
                }
                setCode(newCode);
            }}
            variant="standard"
        >
            {['direction', 'myitem', 'slot'].map(option =>
                <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </Select>
        {condition.value1.type === 'direction' && <Select
            IconComponent={null}
            value={(condition.value1 as ValueDirectionType).value}
            variant="standard"
            onChange={e => {
                const newCode = clone(code) as LineIfType[];
                (newCode[lineNumber].conditions[conditionKey].value1 as ValueDirectionType).value = e.target.value as DirectionTypeWithHere;
                setCode(newCode);
            }}
        >
            {['left', 'right', 'top', 'bottom', 'here', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((option:DirectionType) =>
                <MenuItem key={option} value={option}>
                    {directionIcon(option)}
                    {option}
                </MenuItem>)}
        </Select>}
        {condition.value1.type === 'slot' &&
        <TextField
            type="number"
            value={condition.value1.slot}
            variant="standard"
            onChange={e => {
                const newCode = clone(code) as LineIfType[];
                (newCode[lineNumber].conditions[conditionKey].value1 as ValueSlotType).slot = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />}
        <Select
            IconComponent={null}
            value={condition.operation}
            variant="standard"
            onChange={e => {
                const newCode = clone(code) as LineIfType[];
                newCode[lineNumber].conditions[conditionKey].operation = e.target.value as IfOperationType;
                setCode(newCode);
            }}
        >
            {['==', '>', '<', '>=', '<='].map(option =>
                <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </Select>
        <Select
            IconComponent={null}
            value={(line as LineIfType).conditions[conditionKey].value2.type}
            onChange={e => {
                const newCode = clone(code) as LineIfType[];
                if (e.target.value === 'number') {
                    newCode[lineNumber].conditions[conditionKey].value2 = { type: 'number', value: 0 };
                }
                if (e.target.value === 'myitem') {
                    newCode[lineNumber].conditions[conditionKey].value2 = { type: 'myitem' };
                }
                if (e.target.value === 'direction') {
                    newCode[lineNumber].conditions[conditionKey].value2 = { type: 'direction', value: 'left' };
                }
                if (e.target.value === 'slot') {
                    newCode[lineNumber].conditions[conditionKey].value2 = { type: 'slot', slot: 1 };
                }
                if (e.target.value === 'something') {
                    newCode[lineNumber].conditions[conditionKey].value2 = { type: 'something' };
                }
                if (e.target.value === 'empty') {
                    newCode[lineNumber].conditions[conditionKey].value2 = { type: 'empty' };
                }
                if (e.target.value === 'hole') {
                    newCode[lineNumber].conditions[conditionKey].value2 = { type: 'hole' };
                }
                if (e.target.value === 'character') {
                    newCode[lineNumber].conditions[conditionKey].value2 = { type: 'character' };
                }
                setCode(newCode);
            }}
            variant="standard"
        >
            {['number', 'direction', 'slot', 'myitem', 'something', 'empty', 'hole', 'character', 'box'].map(option =>
                <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </Select>
        {condition.value2.type === 'number' &&
        <TextField
            type="number"
            value={condition.value2.value}
            variant="standard"
            onChange={e => {
                const newCode = clone(code) as LineIfType[];
                (newCode[lineNumber].conditions[conditionKey].value2 as ValueNumberType).value = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />}
        {condition.value2.type === 'direction' && <Select
            IconComponent={null}
            value={(condition.value2 as ValueDirectionType).value}
            variant="standard"
            onChange={e => {
                const newCode = clone(code) as LineIfType[];
                (newCode[lineNumber].conditions[conditionKey].value2 as ValueDirectionType).value = e.target.value as DirectionTypeWithHere;
                setCode(newCode);
            }}
        >
            {['left', 'right', 'top', 'bottom', 'here', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((option:DirectionType) =>
                <MenuItem key={option} value={option}>
                    {directionIcon(option)}
                    {option}
                </MenuItem>)}
        </Select>}
        {condition.value2.type === 'slot' &&
        <TextField
            type="number"
            value={condition.value2.slot}
            variant="standard"
            onChange={e => {
                const newCode = clone(code) as LineIfType[];
                (newCode[lineNumber].conditions[conditionKey].value2 as ValueSlotType).slot = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />}
        <IconButton
            size="small"
            onMouseDown={() => {
                const newCode = clone(code) as LineIfType[];
                newCode[lineNumber].conditions.splice(conditionKey, 1);
                setCode(newCode);
            }}
        >
            <ClearIcon />
        </IconButton>
        <IconButton
            size="small"
            onMouseDown={() => {
                const newCode = clone(code) as LineIfType[];
                newCode[lineNumber].conditions.push({
                    value1: { type: 'direction', value: 'here' },
                    operation: '==',
                    value2: { type: 'number', value: 0 },
                    logic: 'OR',
                });
                setCode(newCode);
            }}
        >
            <AddIcon />
        </IconButton>
    </span>)}

</span>;

export default ifRenderLine;
