import React from 'react';
import { LineEndType, RenderLineType } from '../types';
import { OperatorEndSerialized } from '../Classes/Operators/OperatorEnd';

const endRenderLine:RenderLineType<OperatorEndSerialized> = ():React.ReactNode => 'End';

export default endRenderLine;
