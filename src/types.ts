import React from 'react';
import { GameSerialized } from './Classes/Game';

export type CoordinatesType = string;

export type CoordinatesArrayType = number[];
export type RenderLineType<T, > = (line: T, lineNumber: number, game: GameSerialized) => React.ReactNode
