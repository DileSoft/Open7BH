import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    DirectionType, DirectionTypeWithHere, LineVariableType, RenderLineType, ValueDirectionType, ValueNumberType, ValueSlotType,
} from '../types';
import { clone, directionIcon } from '../Utils';
import { OperatorVariableSerialized, OperatorVariableType } from '../Classes/Operators/OperatorVariable';

const variableRenderLine:RenderLineType<OperatorVariableSerialized> = (line, lineNumber, game):React.ReactNode => <span>
Variable
    {' '}
    slot
    <TextField
        type="number"
        value={line.slot}
        variant="standard"
        onChange={e => {
            line.object.setSlot(parseInt(e.target.value) || 0);
            game.object.render();
        }}
    />
    =
    <Select
        IconComponent={null}
        value={line.variableType}
        onChange={e => {
            if (e.target.value === 'number') {
                line.object.setNumberValue(0);
            }
            if (e.target.value === 'myitem') {
                line.object.setMyItemValue();
            }
            if (e.target.value === 'slot') {
                line.object.setSlotValue(0);
            }
        }}
        variant="standard"
    >
        {Object.values(OperatorVariableType).map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.variableType === 'number' &&
        <TextField
            type="number"
            value={line.numberValue}
            variant="standard"
            onChange={e => {
                line.object.setNumberValue(parseInt(e.target.value) || 0);
                game.object.render();
            }}
        />}
    {/* {line.value.type === 'direction' && <Select
        IconComponent={null}
        value={(line.value as ValueDirectionType).value}
        variant="standard"
        onChange={e => {
            const newCode = clone(code);
            (newCode[lineNumber].value as ValueDirectionType).value = e.target.value as DirectionTypeWithHere;
            setCode(newCode);
        }}
    >
        {['left', 'right', 'top', 'bottom', 'here', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((option:DirectionType) =>
            <MenuItem key={option} value={option}>
                {directionIcon(option)}
                {option}
            </MenuItem>)}
    </Select>} */}
    {line.variableType === 'slot' &&
        <TextField
            type="number"
            value={line.slotValue}
            variant="standard"
            onChange={e => {
                line.object.setSlotValue(parseInt(e.target.value) || 0);
                game.object.render();
            }}
        />}
</span>;

export default variableRenderLine;
