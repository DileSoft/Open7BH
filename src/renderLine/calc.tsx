import { MenuItem, Select, TextField } from "@mui/material";
import React from "react";
import {
    RenderLineType,
} from "../types";
import { CalcOperand, CalcOperator, OperatorCalcSerialized } from "../Classes/Operators/OperatorCalc";
import { DirectionWithHere } from "../Classes/Operators/OperatorStep";
import { DirectionGrid } from "../DirectionGrid";

const calcRenderLine:RenderLineType<OperatorCalcSerialized> = (line, lineNumber, game):React.ReactNode => {
    if (!line.object || !game.object) {
        return null;
    }

    return <span>
Calc
    {" "}
    slot
    <TextField
        type="number"
        value={line.slotResult}
        variant="standard"
        onChange={e => {
            line.object!.slotResult = parseInt(e.target.value) || 0;
            game.object?.render();
        }}
    />
    =
    <Select
        value={line.operand1type}
        onChange={e => {
            if (e.target.value === "number") {
                line.object?.setOperand1Number(0);
            }
            if (e.target.value === "direction") {
                line.object?.setOperand1Direction(DirectionWithHere.Up);
            }
            if (e.target.value === "slot") {
                line.object?.setOperand1Slot(0);
            }
            if (e.target.value === "myItem") {
                line.object?.setOperand1MyItem();
            }
            game.object?.render();
        }}
        variant="standard"
    >
        {Object.values(CalcOperand).map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.operand1type === CalcOperand.Number &&
        <TextField
            type="number"
            value={line.operand1NumberValue}
            variant="standard"
            onChange={e => {
                line.object?.setOperand1Number(parseInt(e.target.value) || 0);
                game.object?.render();
            }}
        />}
    {line.operand1type === CalcOperand.Direction &&
        <DirectionGrid
            value={line.operand1DirectionValue}
            withHere
            onChange={newDir => {
                line.object?.setOperand1Direction(newDir as DirectionWithHere);
                game.object?.render();
            }}
        />
    }
    {line.operand1type === CalcOperand.Slot &&
        <TextField
            type="number"
            value={line.operand1SlotValue}
            variant="standard"
            onChange={e => {
                line.object?.setOperand1Slot(parseInt(e.target.value) || 0);
                game.object?.render();
            }}
        />}

    <Select
        value={line.operator}
        variant="standard"
        onChange={e => {
            line.object!.operator = e.target.value as CalcOperator;
            game.object?.render();
        }}
    >
        {Object.values(CalcOperator).map(option =>
            <MenuItem key={option} value={option}>
                {option}
            </MenuItem>)}
    </Select>

    <Select
        value={line.operand2type}
        onChange={e => {
            if (e.target.value === "number") {
                line.object?.setOperand2Number(0);
            }
            if (e.target.value === "direction") {
                line.object?.setOperand2Direction(DirectionWithHere.Up);
            }
            if (e.target.value === "slot") {
                line.object?.setOperand2Slot(0);
            }
            if (e.target.value === "myItem") {
                line.object?.setOperand2MyItem();
            }
            game.object?.render();
        }}
        variant="standard"
    >
        {Object.values(CalcOperand).map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
    {line.operand2type === CalcOperand.Number &&
        <TextField
            type="number"
            value={line.operand2NumberValue}
            variant="standard"
            onChange={e => {
                line.object?.setOperand2Number(parseInt(e.target.value) || 0);
                game.object?.render();
            }}
        />}
    {line.operand2type === CalcOperand.Direction &&
        <DirectionGrid
            value={line.operand2DirectionValue}
            withHere
            onChange={newDir => {
                line.object?.setOperand2Direction(newDir as DirectionWithHere);
                game.object?.render();
            }}
        />
    }
    {line.operand2type === CalcOperand.Slot &&
        <TextField
            type="number"
            value={line.operand2SlotValue}
            variant="standard"
            onChange={e => {
                line.object?.setOperand2Slot(parseInt(e.target.value) || 0);
                game.object?.render();
            }}
        />}
</span>;
};

export default calcRenderLine;
