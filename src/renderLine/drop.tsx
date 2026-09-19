import React from 'react';
import { RenderLineType } from '../types';
import { OperatorDropSerialized } from '../Classes/Operators/OperatorDrop';
import { OperatorType } from '../Classes/Operators/Operator';
import CommandBadge from './CommandBadge';

const dropRenderLine:RenderLineType<OperatorDropSerialized> = ():React.ReactNode => <CommandBadge type={OperatorType.Drop} />;

export default dropRenderLine;
