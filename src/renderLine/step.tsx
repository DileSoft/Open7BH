import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    RenderLineType,
} from '../types';
import { directionIcon } from '../Utils';
import { Direction, OperatorStepSerialized, StepType } from '../Classes/Operators/OperatorStep';

const stepRenderLine:RenderLineType<OperatorStepSerialized> = (line, lineNumber, game):React.ReactNode => <span>
Step:
    {' '}
    <Select
        IconComponent={null}
        value={line.object.type}
        onChange={e => {
            if (e.target.value === StepType.Direction) {
                line.object.setDirection([Direction.Down]);
                game.object.render();
            }
            if (e.target.value === StepType.Slot) {
                line.object.setSlot(0);
                game.object.render();
            }
        }}
        variant="standard"
    >
        {Object.values(StepType).map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.object.type === StepType.Direction &&
    <Select
        IconComponent={null}
        value={line.object.directions}
        variant="standard"
        multiple
        onChange={e => {
            line.object.setDirection(e.target.value as Direction[]);
            game.object.render();
        }}
    >
        {Object.values(Direction).map((direction:Direction) =>
            <MenuItem key={direction} value={direction}>
                {directionIcon(direction)}
                {direction}
            </MenuItem>)}
    </Select>}
    {line.object.type === StepType.Slot &&
        <TextField
            type="number"
            value={line.slot}
            variant="standard"
            onChange={e => {
                line.object.setSlot(parseInt(e.target.value) || 0);
                game.object.render();
            }}
        />}
</span>;

export default stepRenderLine;
