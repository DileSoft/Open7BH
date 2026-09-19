import React from 'react';
import { RenderLineType } from '../types';
import { OperatorEndSerialized } from '../Classes/Operators/OperatorEnd';
import { OperatorType } from '../Classes/Operators/Operator';
import CommandBadge from './CommandBadge';

const endRenderLine:RenderLineType<OperatorEndSerialized> = ():React.ReactNode => <CommandBadge type={OperatorType.End} />;

export default endRenderLine;
