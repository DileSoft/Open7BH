import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    DirectionType, LineSayType, RenderLineType, ValueDirectionType, ValueSlotType,
} from '../types';
import { clone, directionIcon } from '../Utils';
import { OperatorSaySerialized } from '../Classes/Operators/OperatorSay';
import { Direction } from '../Classes/Operators/OperatorStep';

const sayRenderLine:RenderLineType<OperatorSaySerialized> = (line, lineNumber, game):React.ReactNode => <span>
    Say:
    {' '}
    <TextField
        value={line.hear}
        variant="standard"
        onChange={e => {
            line.object.setSay(e.target.value);
            game.object.render();
        }}
    />
    {/* <Select
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
    {/* {line.target.type === 'slot' &&
        <TextField
            type="number"
            value={line.target.slot}
            variant="standard"
            onChange={e => {
                const newCode = clone(code);
                (newCode[lineNumber].target as ValueSlotType).slot = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />} */}
</span>;

export default sayRenderLine;
