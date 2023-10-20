import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    DirectionType, LineStepType, RenderLineType, StepDirection, ValueSlotType,
} from '../types';
import { clone, directionIcon } from '../Utils';
import OperatorStep, { Direction, OperatorStepSerialized, StepType } from '../Classes/Operators/OperatorStep';

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
            // if (e.target.value === 'slot') {
            //     newCode[lineNumber].destination = {
            //         type: 'slot',
            //         slot: 1,
            //     };
            // }
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
    {/* {line.object.type === StepType.Slot &&
        <TextField
            type="number"
            value={line.object.slot}
            variant="standard"
            onChange={e => {
                const newCode = clone(code);
                (newCode[lineNumber].destination as ValueSlotType).slot = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />} */}
</span>;

export default stepRenderLine;
