import { TextField } from '@mui/material';
import React from 'react';
import { LineHearType, RenderLineType } from '../types';
import { clone } from '../Utils';

const hearRenderLine:RenderLineType<LineHearType> = (line, lineNumber, code, setCode):React.ReactNode => <span>
    Hear:
    {' '}
    <TextField
        value={line.text}
        variant="standard"
        onChange={e => {
            const newCode = clone(code);
            newCode[lineNumber].text = e.target.value;
            setCode(newCode);
        }}
    />
</span>;

export default hearRenderLine;
