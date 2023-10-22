import React from 'react';
import { RenderLineType } from '../types';
import { OperatorDropSerialized } from '../Classes/Operators/OperatorDrop';

const dropRenderLine:RenderLineType<OperatorDropSerialized> = ():React.ReactNode => 'Drop';

export default dropRenderLine;
