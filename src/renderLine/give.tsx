import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import ManIcon from '@mui/icons-material/Man';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import EastIcon from '@mui/icons-material/East';
import {
    DirectionType, LineGiveType, RenderLineType, ValueDirectionType, ValueSlotType,
} from '../types';
import { clone, directionIcon } from '../Utils';
import { OperatorGiveSerialized } from '../Classes/Operators/OperatorGive';
import { Direction } from '../Classes/Operators/OperatorStep';

const giveRenderLine:RenderLineType<OperatorGiveSerialized> = (line, lineNumber, game):React.ReactNode => <span>
Give:
    {' '}
    <ManIcon fontSize="small" />
    <EastIcon fontSize="small" />
    <CheckBoxOutlineBlankIcon fontSize="small" />
    {' '}
    {/* <Select
        IconComponent={null}
        value={line.direction}
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
            value={line.slot}
            variant="standard"
            onChange={e => {
                line.object.slot = parseInt(e.target.value) || 0;
                game.object.render();
            }}
        />} */}
</span>;

export default giveRenderLine;
