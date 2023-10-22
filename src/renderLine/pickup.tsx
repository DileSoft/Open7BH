import React from 'react';
import { RenderLineType } from '../types';
import { OperatorPickupSerialized } from '../Classes/Operators/OperatorPickup';

const pickupRenderLine:RenderLineType<OperatorPickupSerialized> = ():React.ReactNode => 'Pickup';

export default pickupRenderLine;
