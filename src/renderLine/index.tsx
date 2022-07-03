import {
    IconButton,
} from '@mui/material';
import React from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import {
    LineDropType, LineForEachType, LineGiveType, LineGotoType, LineHearType, LineIfType, LineNearType, LinePickupType, LineSayType, LineStepType, LineTakeType, LineType, LineVariableType,
} from '../types';
import stepRenderLine from './step';
import giveRenderLine from './give';
import takeRenderLine from './take';
import gotoRenderLine from './goto';
import ifRenderLine from './if';
import pickupRenderLine from './pickup';
import dropRenderLine from './drop';
import nearRenderLine from './near';
import variableRenderLine from './variable';
import sayRenderLine from './say';
import hearRenderLine from './hear';
import foreachRenderLine from './foreach';

function renderLine(line: LineType, lineNumber: number, code: LineType[], setCode: React.Dispatch<React.SetStateAction<LineType[]>>, intend: number) {
    let result = null;
    if (line.type === 'step') {
        result = stepRenderLine(line, lineNumber, code as LineStepType[], setCode);
    }
    if (line.type === 'give') {
        result = giveRenderLine(line, lineNumber, code as LineGiveType[], setCode);
    }
    if (line.type === 'take') {
        result = takeRenderLine(line, lineNumber, code as LineTakeType[], setCode);
    }
    if (line.type === 'goto') {
        result = gotoRenderLine(line, lineNumber, code as LineGotoType[], setCode);
    }
    if (line.type === 'if') {
        result = ifRenderLine(line, lineNumber, code as LineIfType[], setCode);
    }
    if (line.type === 'endif') {
        result = 'Endif';
    }
    if (line.type === 'pickup') {
        result = pickupRenderLine(line, lineNumber, code as LinePickupType[], setCode);
    }
    if (line.type === 'drop') {
        result = dropRenderLine(line, lineNumber, code as LineDropType[], setCode);
    }
    if (line.type === 'near') {
        result = nearRenderLine(line, lineNumber, code as LineNearType[], setCode);
    }
    if (line.type === 'variable') {
        result = variableRenderLine(line, lineNumber, code as LineVariableType[], setCode);
    }
    if (line.type === 'say') {
        result = sayRenderLine(line, lineNumber, code as LineSayType[], setCode);
    }
    if (line.type === 'hear') {
        result = hearRenderLine(line, lineNumber, code as LineHearType[], setCode);
    }
    if (line.type === 'foreach') {
        result = foreachRenderLine(line, lineNumber, code as LineForEachType[], setCode);
    }
    if (line.type === 'endforeach') {
        result = 'Endforeach';
    }
    if (!result) {
        result = JSON.stringify(line);
    }

    if (line.type === 'endif') {
        intend -= 20;
    }
    if (line.type === 'endforeach') {
        intend -= 20;
    }
    result = <span key={lineNumber}>
        {lineNumber}
        {': '}
        <span style={{ paddingLeft: intend }}>{result}</span>
        <IconButton
            size="small"
            onMouseDown={() => {
                const newCode = [...code];
                const deleteLine = newCode[lineNumber];
                newCode.splice(lineNumber, 1);
                if (deleteLine.type === 'if') {
                    newCode.splice(newCode.findIndex(foundLine => foundLine.type === 'endif' && foundLine.ifId === deleteLine.id), 1);
                }
                if (deleteLine.type === 'endif') {
                    newCode.splice(newCode.findIndex(foundLine => foundLine.type === 'if' && foundLine.id === deleteLine.ifId), 1);
                }
                if (deleteLine.type === 'foreach') {
                    newCode.splice(newCode.findIndex(foundLine => foundLine.type === 'endforeach' && foundLine.foreachId === deleteLine.id), 1);
                }
                if (deleteLine.type === 'endforeach') {
                    newCode.splice(newCode.findIndex(foundLine => foundLine.type === 'foreach' && foundLine.id === deleteLine.foreachId), 1);
                }
                setCode(newCode);
            }}
        >
            <DeleteIcon fontSize="small" />
        </IconButton>
    </span>;
    if (line.type === 'if') {
        intend += 20;
    }
    if (line.type === 'foreach') {
        intend += 20;
    }

    return { result, intend };
}

export default renderLine;
