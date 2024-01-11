import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    RenderLineType,
} from '../types';
import { OperatorWriteSerialized, WriteType } from '../Classes/Operators/OperatorWrite';

const writeRenderLine:RenderLineType<OperatorWriteSerialized> = (line, lineNumber, game):React.ReactNode => <span>
Write
    {' '}
    {/* <Select
        IconComponent={null}
        value={line.value.type}
        onChange={e => {
            const newCode = clone(code);
            if (e.target.value === 'number') {
                newCode[lineNumber].value = { type: 'number', value: 0 };
            }
            if (e.target.value === 'myitem') {
                newCode[lineNumber].value = { type: 'myitem' };
            }
            if (e.target.value === 'direction') {
                newCode[lineNumber].value = { type: 'direction', value: 'left' };
            }
            if (e.target.value === 'slot') {
                newCode[lineNumber].value = { type: 'slot', slot: 1 };
            }
            setCode(newCode);
        }}
        variant="standard"
    >
        {['number', 'direction', 'slot', 'myitem'].map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select> */}
    <Select
        IconComponent={null}
        value={line.writeType}
        onChange={e => {
            if (e.target.value === 'number') {
                // line.object.setOperand1Number(0);
            }
            // if (e.target.value === 'direction') {
            //     line.object.setOperand1Direction(DirectionWithHere.Up);
            // }
            // if (e.target.value === 'slot') {
            //     line.object.setOperand1Slot(0);
            // }
            if (e.target.value === 'myItem') {
                // line.object.setOperand1MyItem();
            }
            game.object.render();
        }}
        variant="standard"
    >
        {Object.values(WriteType).map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.writeType === WriteType.Number &&
        <TextField
            type="number"
            value={line.value}
            variant="standard"
            onChange={e => {
                line.object.value = parseInt(e.target.value) || 0;
                game.object.render();
            }}
        />
    }
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
    </Select>}
    {line.value.type === 'slot' &&
        <TextField
            type="number"
            value={line.value.slot}
            variant="standard"
            onChange={e => {
                const newCode = clone(code);
                (newCode[lineNumber].value as ValueSlotType).slot = parseInt(e.target.value) || 0;
                setCode(newCode);
            }}
        />} */}
</span>;

export default writeRenderLine;
