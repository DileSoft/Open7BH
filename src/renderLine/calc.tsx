import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    RenderLineType,
} from '../types';
import { directionIcon } from '../Utils';
import { CalcOperand, CalcOperator, OperatorCalcSerialized } from '../Classes/Operators/OperatorCalc';
import { Direction } from '../Classes/Operators/OperatorStep';

const calcRenderLine:RenderLineType<OperatorCalcSerialized> = (line, lineNumber, game):React.ReactNode => <span>
Calc
    {' '}
    slot
    <TextField
        type="number"
        value={line.slotResult}
        variant="standard"
        onChange={e => {
            line.object.slotResult = parseInt(e.target.value) || 0;
            game.object.render();
        }}
    />
    =
    <Select
        IconComponent={null}
        value={line.operand1type}
        onChange={e => {
            if (e.target.value === 'number') {
                line.object.setOperand1Number(0);
            }
            if (e.target.value === 'direction') {
                line.object.setOperand1Direction(Direction.Up);
            }
            if (e.target.value === 'slot') {
                line.object.setOperand1Slot(0);
            }
            game.object.render();
        }}
        variant="standard"
    >
        {Object.values(CalcOperator).map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.operand1type === CalcOperand.Number &&
        <TextField
            type="number"
            value={line.operand1NumberValue}
            variant="standard"
            onChange={e => {
                line.object.setOperand1Number(parseInt(e.target.value) || 0);
                game.object.render();
            }}
        />}
    {line.operand1type === CalcOperand.Direction && <Select
        IconComponent={null}
        value={line.operand1DirectionValue}
        variant="standard"
        onChange={e => {
            line.object.setOperand1Direction(e.target.value as Direction);
            game.object.render();
        }}
    >
        {Object.values(Direction).map(option =>
            <MenuItem key={option} value={option}>
                {directionIcon(option)}
                {option}
            </MenuItem>)}
    </Select>}
    {line.operand1type === CalcOperand.Slot &&
        <TextField
            type="number"
            value={line.operand1SlotValue}
            variant="standard"
            onChange={e => {
                line.object.setOperand1Slot(parseInt(e.target.value) || 0);
                game.object.render();
            }}
        />}

    <Select
        IconComponent={null}
        value={line.operator}
        variant="standard"
        onChange={e => {
            line.operator = e.target.value as CalcOperator;
        }}
    >
        {Object.values(CalcOperator).map(option =>
            <MenuItem key={option} value={option}>
                {option}
            </MenuItem>)}
    </Select>

    <Select
        IconComponent={null}
        value={line.operand2type}
        onChange={e => {
            if (e.target.value === 'number') {
                line.object.setOperand2Number(0);
            }
            if (e.target.value === 'direction') {
                line.object.setOperand2Direction(Direction.Up);
            }
            if (e.target.value === 'slot') {
                line.object.setOperand2Slot(0);
            }
            game.object.render();
        }}
        variant="standard"
    >
        {['number', 'direction', 'slot', 'myitem'].map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.operand2type === CalcOperand.Number &&
        <TextField
            type="number"
            value={line.operand2NumberValue}
            variant="standard"
            onChange={e => {
                line.object.setOperand2Number(parseInt(e.target.value) || 0);
                game.object.render();
            }}
        />}
    {line.operand2type === CalcOperand.Direction && <Select
        IconComponent={null}
        value={line.operand2DirectionValue}
        variant="standard"
        onChange={e => {
            line.object.setOperand2Direction(e.target.value as Direction);
            game.object.render();
        }}
    >
        {Object.values(Direction).map(option =>
            <MenuItem key={option} value={option}>
                {directionIcon(option)}
                {option}
            </MenuItem>)}
    </Select>}
    {line.operand2type === CalcOperand.Slot &&
        <TextField
            type="number"
            value={line.operand2SlotValue}
            variant="standard"
            onChange={e => {
                line.object.setOperand2Slot(parseInt(e.target.value) || 0);
                game.object.render();
            }}
        />}
</span>;

export default calcRenderLine;
