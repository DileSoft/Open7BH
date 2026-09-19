import React from 'react';
import { RenderLineType } from '../types';
import { OperatorPickupSerialized } from '../Classes/Operators/OperatorPickup';
import { OperatorType } from '../Classes/Operators/Operator';
import CommandBadge from './CommandBadge';

const pickupRenderLine:RenderLineType<OperatorPickupSerialized> = ():React.ReactNode => <CommandBadge type={OperatorType.Pickup} />;

export default pickupRenderLine;
