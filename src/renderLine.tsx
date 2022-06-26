import {
    IconButton, MenuItem, Select, TextField,
} from '@mui/material';
import React from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import ManIcon from '@mui/icons-material/Man';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { clone, directionIcon } from './Utils';
import {
    DirectionType, DirectionTypeWithHere, IfOperationType, LineGiveType, LineGotoType, LineIfType, LineStepType, LineType, ValueDirectionType, ValueNumberType, StepDirection,
} from './types';

function renderLine(line: LineType, lineNumber: number, code: LineType[], setCode: React.Dispatch<React.SetStateAction<LineType[]>>, intend: number) {
    let result = null;
    if (line.type === 'step') {
        result = <span>
Step:
            {' '}
            <Select
                IconComponent={null}
                value={(line.destination as StepDirection).directions}
                variant="standard"
                multiple
                onChange={e => {
                    const newCode = clone(code) as LineStepType[];
                    (newCode[lineNumber].destination as StepDirection).directions = e.target.value as DirectionType[];
                    setCode(newCode);
                }}
            >
                {['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((direction:DirectionType) =>
                    <MenuItem key={direction} value={direction}>
                        {directionIcon(direction)}
                        {direction}
                    </MenuItem>)}
            </Select>
        </span>;
    }
    if (line.type === 'give') {
        result = <span>
Give:
            {' '}
            <ManIcon fontSize="small" />
            <EastIcon fontSize="small" />
            <CheckBoxOutlineBlankIcon fontSize="small" />
            {' '}
            <Select
                IconComponent={null}
                value={line.direction}
                variant="standard"
                onChange={e => {
                    const newCode = clone(code) as LineGiveType[];
                    newCode[lineNumber].direction = e.target.value as DirectionType;
                    setCode(newCode);
                }}
            >
                {['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((direction:DirectionType) =>
                    <MenuItem key={direction} value={direction}>
                        {directionIcon(direction)}
                        {direction}
                    </MenuItem>)}
            </Select>
        </span>;
    }
    if (line.type === 'take') {
        result = <span>
                Take
            {' '}
            <ManIcon fontSize="small" />
            <WestIcon fontSize="small" />
            <CheckBoxOutlineBlankIcon fontSize="small" />
            {' '}
            <Select
                IconComponent={null}
                value={line.direction}
                variant="standard"
                onChange={e => {
                    const newCode = clone(code) as LineGiveType[];
                    newCode[lineNumber].direction = e.target.value as DirectionType;
                    setCode(newCode);
                }}
            >
                {['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((direction:DirectionType) =>
                    <MenuItem key={direction} value={direction}>
                        {directionIcon(direction)}
                        {direction}
                    </MenuItem>)}
            </Select>
        </span>;
    }
    if (line.type === 'goto') {
        result = <span>
Goto:
            {' '}
            <Select
                IconComponent={null}
                value={line.step}
                variant="standard"
                onChange={e => {
                    const newCode = clone(code) as LineGotoType[];
                    newCode[lineNumber].step = e.target.value as number;
                    setCode(newCode);
                }}
            >
                {Object.keys(code).map(optionLineNumber =>
                    <MenuItem key={optionLineNumber} value={optionLineNumber}>{optionLineNumber}</MenuItem>)}
            </Select>
        </span>;
    }
    if (line.type === 'if') {
        result = <span>
If:
            {' '}
            <Select
                IconComponent={null}
                value={(line as LineIfType).conditions[0].value1.type}
                onChange={e => {
                    const newCode = clone(code) as LineIfType[];
                    setCode(newCode);
                }}
                variant="standard"
            >
                {['direction', 'myitem', 'slot'].map(option =>
                    <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </Select>
            <Select
                IconComponent={null}
                value={(line.conditions[0].value1 as ValueDirectionType).value}
                variant="standard"
                onChange={e => {
                    const newCode = clone(code) as LineIfType[];
                    (newCode[lineNumber].conditions[0].value1 as ValueDirectionType).value = e.target.value as DirectionTypeWithHere;
                    setCode(newCode);
                }}
            >
                {['left', 'right', 'top', 'bottom', 'here', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((option:DirectionType) =>
                    <MenuItem key={option} value={option}>
                        {directionIcon(option)}
                        {option}
                    </MenuItem>)}
            </Select>
            <Select
                IconComponent={null}
                value={line.conditions[0].operation}
                variant="standard"
                onChange={e => {
                    const newCode = clone(code) as LineIfType[];
                    newCode[lineNumber].conditions[0].operation = e.target.value as IfOperationType;
                    setCode(newCode);
                }}
            >
                {['==', '>', '<', '>=', '<='].map(option =>
                    <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </Select>
            <Select
                IconComponent={null}
                value={(line as LineIfType).conditions[0].value2.type}
                onChange={e => {
                    const newCode = clone(code) as LineIfType[];
                    if (e.target.value === 'number') {
                        newCode[lineNumber].conditions[0].value2 = { type: 'number', value: 0 };
                    }
                    if (e.target.value === 'myitem') {
                        newCode[lineNumber].conditions[0].value2 = { type: 'myitem' };
                    }
                    if (e.target.value === 'direction') {
                        newCode[lineNumber].conditions[0].value2 = { type: 'direction', value: 'left' };
                    }
                    if (e.target.value === 'slot') {
                        newCode[lineNumber].conditions[0].value2 = { type: 'slot', slot: 1 };
                    }
                    if (e.target.value === 'something') {
                        newCode[lineNumber].conditions[0].value2 = { type: 'something' };
                    }
                    if (e.target.value === 'empty') {
                        newCode[lineNumber].conditions[0].value2 = { type: 'empty' };
                    }
                    if (e.target.value === 'hole') {
                        newCode[lineNumber].conditions[0].value2 = { type: 'hole' };
                    }
                    if (e.target.value === 'character') {
                        newCode[lineNumber].conditions[0].value2 = { type: 'character' };
                    }
                    setCode(newCode);
                }}
                variant="standard"
            >
                {['number', 'myitem', 'direction', 'something', 'empty', 'hole', 'character', 'box', 'slot'].map(option =>
                    <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </Select>
            {line.conditions[0].value2.type === 'number' ?
                <TextField
                    type="number"
                    value={line.conditions[0].value2.value}
                    variant="standard"
                    onChange={e => {
                        const newCode = clone(code) as LineIfType[];
                        (newCode[lineNumber].conditions[0].value2 as ValueNumberType).value = parseInt(e.target.value) || 0;
                        setCode(newCode);
                    }}
                /> : null}

        </span>;
    }
    if (line.type === 'endif') {
        result = 'Endif';
    }
    if (line.type === 'pickup') {
        result = 'Pickup';
    }
    if (!result) {
        result = JSON.stringify(line);
    }

    if (line.type === 'endif') {
        intend -= 20;
    }
    result = <span key={lineNumber}>
        {lineNumber}
        {': '}
        <span style={{ paddingLeft: intend }}>{result}</span>
        <IconButton
            size="small"
            onMouseDown={() => {
                const newCode = [...code];
                const deleteLine = newCode[lineNumber];
                newCode.splice(lineNumber, 1);
                if (deleteLine.type === 'if') {
                    newCode.splice(newCode.findIndex(foundLine => foundLine.type === 'endif' && foundLine.ifId === deleteLine.id), 1);
                }
                if (deleteLine.type === 'endif') {
                    newCode.splice(newCode.findIndex(foundLine => foundLine.type === 'if' && foundLine.id === deleteLine.ifId), 1);
                }
                setCode(newCode);
            }}
        >
            <DeleteIcon fontSize="small" />
        </IconButton>
    </span>;
    if (line.type === 'if') {
        intend += 20;
    }

    return { result, intend };
}

export default renderLine;
