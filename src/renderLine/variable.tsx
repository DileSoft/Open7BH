import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    RenderLineType,
} from '../types';
import { OperatorVariableSerialized, OperatorVariableType } from '../Classes/Operators/OperatorVariable';
import { DirectionWithHere } from '../Classes/Operators/OperatorStep';
import { DirectionGrid } from '../DirectionGrid';
import { OperatorType } from '../Classes/Operators/Operator';
import CommandBadge from './CommandBadge';

const variableOptions = [
    OperatorVariableType.Number,
    OperatorVariableType.Slot,
    OperatorVariableType.MyItem,
    OperatorVariableType.Direction,
];

const variableRenderLine:RenderLineType<OperatorVariableSerialized> = (line, lineNumber, game):React.ReactNode => <span>
<CommandBadge type={OperatorType.Variable}>Variable</CommandBadge>
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
        value={variableOptions.includes(line.variableType) ? line.variableType : OperatorVariableType.Direction}
        onChange={e => {
            if (e.target.value === OperatorVariableType.Number) {
                line.object.setNumberValue(0);
            }
            if (e.target.value === OperatorVariableType.MyItem) {
                line.object.setMyItemValue();
            }
            if (e.target.value === OperatorVariableType.Slot) {
                line.object.setSlotValue(0);
            }
            if (e.target.value === OperatorVariableType.Direction) {
                line.object.setDirectionValue(DirectionWithHere.Here);
            }
            game.object.render();
        }}
        variant="standard"
    >
        {variableOptions.map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.variableType === OperatorVariableType.Number &&
        <TextField
            type="number"
            value={line.numberValue}
            variant="standard"
            onChange={e => {
                line.object.setNumberValue(parseInt(e.target.value) || 0);
                game.object.render();
            }}
        />}
    {line.variableType === OperatorVariableType.Slot &&
        <TextField
            type="number"
            value={line.slotValue}
            variant="standard"
            onChange={e => {
                line.object.setSlotValue(parseInt(e.target.value) || 0);
                game.object.render();
            }}
        />}
    {(line.variableType === OperatorVariableType.Direction
        || line.variableType === OperatorVariableType.Cell
        || line.variableType === OperatorVariableType.Worker
        || line.variableType === OperatorVariableType.Nothing) &&
        <DirectionGrid
            value={line.directionValue ?? DirectionWithHere.Here}
            withHere
            onChange={newDir => {
                line.object.setDirectionValue(newDir as DirectionWithHere);
                game.object.render();
            }}
        />}
</span>;

export default variableRenderLine;
