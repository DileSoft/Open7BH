import { TextField } from '@mui/material';
import React from 'react';
import { LineHearType, RenderLineType } from '../types';
import { clone } from '../Utils';
import { OperatorHearSerialized } from '../Classes/Operators/OperatorHear';

const hearRenderLine:RenderLineType<OperatorHearSerialized> = (line, lineNumber, game):React.ReactNode => <span>
    Hear:
    {' '}
    <TextField
        value={line.hear}
        variant="standard"
        onChange={e => {
            line.object.hear = e.target.value;
            game.object.render();
        }}
    />
</span>;

export default hearRenderLine;
