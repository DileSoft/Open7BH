import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    RenderLineType,
} from '../types';
import { Direction, OperatorStepSerialized, StepType } from '../Classes/Operators/OperatorStep';
import { DirectionGrid } from '../DirectionGrid';

const stepRenderLine:RenderLineType<OperatorStepSerialized> = (line, lineNumber, game):React.ReactNode => {
    if (!line.object || !game.object) {
        return null;
    }

    return <span>
Step:
    {' '}
    <Select
        value={line.object.type}
        onChange={e => {
            if (e.target.value === StepType.Direction) {
                line.object?.setDirection([Direction.Down]);
                game.object?.render();
            }
            if (e.target.value === StepType.Slot) {
                line.object?.setSlot(0);
                game.object?.render();
            }
        }}
        variant="standard"
    >
        {Object.values(StepType).map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.object.type === StepType.Direction &&
        <DirectionGrid
            value={line.object.directions || []}
            multiple
            onChange={newDirs => {
                line.object?.setDirection(newDirs as Direction[]);
                game.object?.render();
            }}
        />
    }
    {line.object.type === StepType.Slot &&
        <TextField
            type="number"
            value={line.slot}
            variant="standard"
            onChange={e => {
                line.object?.setSlot(parseInt(e.target.value) || 0);
                game.object?.render();
            }}
        />}
</span>;
};

export default stepRenderLine;
