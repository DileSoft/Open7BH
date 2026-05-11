import {
    IconButton, MenuItem, Select, TextField,
} from "@mui/material";
import React from "react";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import {
    RenderLineType,
} from "../types";
import {
    OperandIfLeftType, OperandIfRightType, OperatorIfCondition, OperatorIfLogic, OperatorIfSerialized,
} from "../Classes/Operators/OperatorIf";
import { Direction, DirectionWithHere } from "../Classes/Operators/OperatorStep";
import { DirectionGrid } from "../DirectionGrid";

const ifRenderLine:RenderLineType<OperatorIfSerialized> = (line, lineNumber, game):React.ReactNode => {
    if (!line.object || !game.object) {
        return null;
    }

    return <span>
If:
    {" "}
    {line.conditions.map((condition, conditionKey) => <span key={conditionKey}>
        {!!conditionKey && <Select
            value={condition.logic}
            variant="standard"
            onChange={e => {
                line.object!.conditions[conditionKey].logic = e.target.value as OperatorIfLogic;
                game.object?.render();
            }}
        >
            {Object.values(OperatorIfLogic).map(option =>
                <MenuItem key={option} value={option}>
                    {option}
                </MenuItem>)}
        </Select>}
        <Select
            value={condition.leftType}
            onChange={e => {
                line.object!.conditions[conditionKey].leftType = e.target.value as OperandIfLeftType;
                game.object?.render();
            }}
            variant="standard"
        >
            {Object.values(OperandIfLeftType).map(option =>
                <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </Select>
        {condition.leftType === "number" &&
        <TextField
            type="number"
            value={condition.leftNumber}
            variant="standard"
            onChange={e => {
                line.object!.conditions[conditionKey].leftNumber = parseInt(e.target.value) || 0;
                game.object?.render();
            }}
        />}
        {condition.leftType === "direction" &&
            <DirectionGrid
                value={condition.leftDirection as DirectionWithHere}
                withHere
                onChange={newDir => {
                    line.object!.conditions[conditionKey].leftDirection = newDir as DirectionWithHere;
                    game.object?.render();
                }}
            />
        }
        {condition.leftType === "slot" &&
        <TextField
            type="number"
            value={condition.leftSlot}
            variant="standard"
            onChange={e => {
                line.object!.conditions[conditionKey].leftSlot = parseInt(e.target.value) || 0;
                game.object?.render();
            }}
        />}
        <Select
            value={condition.type}
            variant="standard"
            onChange={e => {
                line.object!.conditions[conditionKey].type = e.target.value as OperatorIfCondition;
                game.object?.render();
            }}
        >
            {Object.values(OperatorIfCondition).map(option =>
                <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </Select>
        <Select
            value={condition.rightType}
            onChange={e => {
                line.object!.conditions[conditionKey].rightType = e.target.value as OperandIfRightType;
                game.object?.render();
            }}
            variant="standard"
        >
            {Object.values(OperandIfRightType).map(option =>
                <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </Select>
        {condition.rightType === "number" &&
        <TextField
            type="number"
            value={condition.rightNumber}
            variant="standard"
            onChange={e => {
                line.object!.conditions[conditionKey].rightNumber = parseInt(e.target.value) || 0;
                game.object?.render();
            }}
        />}
        {condition.rightType === "direction" &&
            <DirectionGrid
                value={condition.rightDirection as DirectionWithHere}
                withHere
                onChange={newDir => {
                    line.object!.conditions[conditionKey].rightDirection = newDir as DirectionWithHere;
                    game.object?.render();
                }}
            />
        }
        {condition.rightType === "slot" &&
        <TextField
            type="number"
            value={condition.rightSlot}
            variant="standard"
            onChange={e => {
                line.object!.conditions[conditionKey].rightSlot = parseInt(e.target.value) || 0;
                game.object?.render();
            }}
        />}
        {line.conditions.length > 1 && <IconButton
            size="small"
            onMouseDown={() => {
                line.object?.removeCondition(conditionKey);
                game.object?.render();
            }}
        >
            <ClearIcon />
        </IconButton>}
        {conditionKey === line.conditions.length - 1 &&
        <IconButton
            size="small"
            onMouseDown={() => {
                line.object?.addCondition();
                game.object?.render();
            }}
        >
            <AddIcon />
        </IconButton>}
    </span>)}
</span>;
};

export default ifRenderLine;
