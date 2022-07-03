import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    LineNearType, RenderLineType,
} from '../types';
import { clone } from '../Utils';

const nearRenderLine:RenderLineType<LineNearType> = (line, lineNumber, code, setCode):React.ReactNode => <span>
Near:
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
        value={line.find}
        onChange={e => {
            const newCode = clone(code);
            newCode[lineNumber].find = e.target.value as any;
            setCode(newCode);
        }}
        variant="standard"
    >
        {['box', 'wall', 'hole', 'character', 'printer', 'shredder'].map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
</span>;

export default nearRenderLine;
