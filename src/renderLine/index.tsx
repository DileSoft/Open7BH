import {
    IconButton,
} from '@mui/material';
import React from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import {
    LineCalcType,
    LineDropType, LineForEachType, LineGiveType, LineGotoType, LineHearType, LineIfType, LineNearType, LinePickupType, LineSayType, LineStepType, LineTakeType, LineType, LineVariableType,
    LineEndType, LineWriteType,
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
import calcRenderLine from './calc';
import sayRenderLine from './say';
import hearRenderLine from './hear';
import foreachRenderLine from './foreach';
import endRenderLine from './end';
import writeRenderLine from './write';
import Operator, { OperatorSerialized } from '../Classes/Operators/Operator';
import { GameSerialized } from '../Classes/Game';
import { OperatorStepSerialized } from '../Classes/Operators/OperatorStep';
import { OperatorPickupSerialized } from '../Classes/Operators/OperatorPickup';
import { OperatorGotoSerialized } from '../Classes/Operators/OperatorGoto';
import { OperatorDropSerialized } from '../Classes/Operators/OperatorDrop';
import { OperatorWriteSerialized } from '../Classes/Operators/OperatorWrite';
import { OperatorEndSerialized } from '../Classes/Operators/OperatorEnd';
import { OperatorTakeSerialized } from '../Classes/Operators/OperatorTake';
import { OperatorGiveSerialized } from '../Classes/Operators/OperatorGive';
import { OperatorIfSerialized } from '../Classes/Operators/OperatorIf';
import { OperatorNearSerialized } from '../Classes/Operators/OperatorNear';
import { OperatorVariableSerialized } from '../Classes/Operators/OperatorVariable';
import { OperatorCalcSerialized } from '../Classes/Operators/OperatorCalc';
import { OperatorSaySerialized } from '../Classes/Operators/OperatorSay';
import { OperatorHearSerialized } from '../Classes/Operators/OperatorHear';
import { OperatorForeachSerialized } from '../Classes/Operators/OperatorForeach';

function renderLine(line: OperatorSerialized, lineNumber: number, game: GameSerialized, intend: number) {
    let result = null;
    if (line.type === 'step') {
        result = stepRenderLine(line as OperatorStepSerialized, lineNumber, game);
    }
    if (line.type === 'give') {
        result = giveRenderLine(line as OperatorGiveSerialized, lineNumber, game);
    }
    if (line.type === 'take') {
        result = takeRenderLine((line as OperatorTakeSerialized), lineNumber, game);
    }
    if (line.type === 'goto') {
        result = gotoRenderLine((line as OperatorGotoSerialized), lineNumber, game);
    }
    if (line.type === 'if') {
        result = ifRenderLine((line as OperatorIfSerialized), lineNumber, game);
    }
    if (line.type === 'endif') {
        result = 'Endif';
    }
    if (line.type === 'pickup') {
        result = pickupRenderLine((line as OperatorPickupSerialized), lineNumber, game);
    }
    if (line.type === 'drop') {
        result = dropRenderLine((line as OperatorDropSerialized), lineNumber, game);
    }
    if (line.type === 'near') {
        result = nearRenderLine((line as OperatorNearSerialized), lineNumber, game);
    }
    if (line.type === 'variable') {
        result = variableRenderLine((line as OperatorVariableSerialized), lineNumber, game);
    }
    if (line.type === 'calc') {
        result = calcRenderLine((line as OperatorCalcSerialized), lineNumber, game);
    }
    if (line.type === 'say') {
        result = sayRenderLine((line as OperatorSaySerialized), lineNumber, game);
    }
    if (line.type === 'hear') {
        result = hearRenderLine((line as OperatorHearSerialized), lineNumber, game);
    }
    if (line.type === 'foreach') {
        result = foreachRenderLine((line as OperatorForeachSerialized), lineNumber, game);
    }
    if (line.type === 'endforeach') {
        result = 'Endforeach';
    }
    if (line.type === 'end') {
        result = endRenderLine(line as OperatorEndSerialized, lineNumber, game);
    }
    if (line.type === 'write') {
        result = writeRenderLine((line as OperatorWriteSerialized), lineNumber, game);
    }
    // if (!result) {
    //     result = JSON.stringify(line);
    // }

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
                game.object.removeOperator(lineNumber);
                game.object.render();
                // if (deleteLine.type === 'if') {
                //     newCode.splice(newCode.findIndex(foundLine => foundLine.type === 'endif' && foundLine.ifId === deleteLine.id), 1);
                // }
                // if (deleteLine.type === 'endif') {
                //     newCode.splice(newCode.findIndex(foundLine => foundLine.type === 'if' && foundLine.id === deleteLine.ifId), 1);
                // }
                // if (deleteLine.type === 'foreach') {
                //     newCode.splice(newCode.findIndex(foundLine => foundLine.type === 'endforeach' && foundLine.foreachId === deleteLine.id), 1);
                // }
                // if (deleteLine.type === 'endforeach') {
                //     newCode.splice(newCode.findIndex(foundLine => foundLine.type === 'foreach' && foundLine.id === deleteLine.foreachId), 1);
                // }
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
