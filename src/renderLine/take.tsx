import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import ManIcon from '@mui/icons-material/Man';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import WestIcon from '@mui/icons-material/West';
import { clone, directionIcon } from '../Utils';
import {
    DirectionType, LineTakeType, RenderLineType, ValueDirectionType, ValueSlotType,
} from '../types';

const takeRenderLine:RenderLineType<LineTakeType> = (line, lineNumber, code, setCode):React.ReactNode => <span>
Take
    {' '}
    <ManIcon fontSize="small" />
    <WestIcon fontSize="small" />
    <CheckBoxOutlineBlankIcon fontSize="small" />
    {' '}
    <Select
        IconComponent={null}
        value={line.direction.type}
        onChange={e => {
            const newCode = clone(code);
            if (e.target.value === 'direction') {
                newCode[lineNumber].direction = {
                    type: 'direction',
                    value: 'left',
                };
            }
            if (e.target.value === 'slot') {
                newCode[lineNumber].direction = {
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
    <Select
        IconComponent={null}
        value={(line.direction as ValueDirectionType).value}
        variant="standard"
        onChange={e => {
            const newCode = clone(code);
            (newCode[lineNumber].direction as ValueDirectionType).value = e.target.value as DirectionType;
            setCode(newCode);
        }}
    >
        {['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((direction:DirectionType) =>
            <MenuItem key={direction} value={direction}>
                {directionIcon(direction)}
                {direction}
            </MenuItem>)}
    </Select>
    {line.direction.type === 'slot' &&
        <TextField
            type="number"
            value={line.direction.slot}
            variant="standard"
            onChange={e => {
                const newCode = clone(code);
                (newCode[lineNumber].direction as ValueSlotType).slot = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />}
</span>;

export default takeRenderLine;
