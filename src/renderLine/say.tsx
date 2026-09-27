import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    RenderLineType,
} from '../types';
import { OperatorSaySerialized } from '../Classes/Operators/OperatorSay';
import { Direction } from '../Classes/Operators/OperatorStep';
import { DirectionGrid } from '../DirectionGrid';
import { OperatorType } from '../Classes/Operators/Operator';
import CommandBadge from './CommandBadge';
import { trOption } from '../tr';

type SayTarget = 'direction' | 'all' | 'slot';

const sayRenderLine:RenderLineType<OperatorSaySerialized> = (line, lineNumber, game):React.ReactNode => {
    if (!line.object || !game.object) {
        return null;
    }

    const target: SayTarget = line.slot !== undefined
        ? 'slot'
        : (line.direction === 'all' ? 'all' : 'direction');

    return <span>
    <CommandBadge type={OperatorType.Say} />
    {' '}
    <TextField
        value={line.hear}
        variant="standard"
        onChange={e => {
            line.object?.setSay(e.target.value);
            game.object?.render();
        }}
    />
    <Select
        value={target}
        variant="standard"
        onChange={e => {
            const value = e.target.value as SayTarget;
            if (value === 'direction') {
                line.object?.setDirection(Direction.Down);
            }
            if (value === 'all') {
                line.object?.setDirection('all');
            }
            if (value === 'slot') {
                line.object?.setSlot(0);
            }
            game.object?.render();
        }}
    >
        <MenuItem value="direction">{trOption('sayTarget', 'direction')}</MenuItem>
        <MenuItem value="all">{trOption('sayTarget', 'all')}</MenuItem>
        <MenuItem value="slot">{trOption('sayTarget', 'slot')}</MenuItem>
    </Select>
    {target === 'direction' &&
        <DirectionGrid
            value={line.direction as Direction}
            onChange={newDir => {
                line.object?.setDirection(newDir as Direction);
                game.object?.render();
            }}
        />
    }
    {target === 'slot' &&
        <TextField
            type="number"
            value={line.slot}
            variant="standard"
            onChange={e => {
                line.object?.setSlot(parseInt(e.target.value) || 0);
                game.object?.render();
            }}
        />
    }
</span>;
};

export default sayRenderLine;
