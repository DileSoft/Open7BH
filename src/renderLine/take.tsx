import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import ManIcon from '@mui/icons-material/Man';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import WestIcon from '@mui/icons-material/West';
import { directionIcon } from '../Utils';
import {
    RenderLineType,
} from '../types';
import { OperatorTakeSerialized } from '../Classes/Operators/OperatorTake';
import { Direction } from '../Classes/Operators/OperatorStep';

const takeRenderLine:RenderLineType<OperatorTakeSerialized> = (line, lineNumber, game):React.ReactNode => <span>
Take
    {' '}
    <ManIcon fontSize="small" />
    <WestIcon fontSize="small" />
    <CheckBoxOutlineBlankIcon fontSize="small" />
    {' '}
    {/* <Select
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
    </Select> */}
    <Select
        IconComponent={null}
        value={line.direction}
        variant="standard"
        onChange={e => {
            line.object.setDirection(e.target.value as Direction);
            game.object.render();
        }}
    >
        {Object.values(Direction).map(direction =>
            <MenuItem key={direction} value={direction}>
                {directionIcon(direction)}
                {direction}
            </MenuItem>)}
    </Select>
    {/* {line.direction.type === 'slot' &&
        <TextField
            type="number"
            value={line.direction.slot}
            variant="standard"
            onChange={e => {
                const newCode = clone(code);
                (newCode[lineNumber].direction as ValueSlotType).slot = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />} */}
</span>;

export default takeRenderLine;
