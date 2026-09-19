import * as PIXI from 'pixi.js';
import { PixiRenderer } from '../../PixiRenderer';

export function drawBody(charGraphics: PIXI.Graphics, color: string) {
    const bodyColor = PixiRenderer.colorToHex(color);
    charGraphics.clear();
    charGraphics.circle(0, -15, 12);
    charGraphics.fill(0xffc0cb);
    charGraphics.circle(-4, -17, 1.5);
    charGraphics.circle(4, -17, 1.5);
    charGraphics.fill(0x000000);
    charGraphics.ellipse(0, 10, 15, 20);
    charGraphics.fill(bodyColor);
    // Chest badge in character color outline, white fill
    charGraphics.circle(0, 10, 5);
    charGraphics.fill(0xffffff);
    charGraphics.stroke({ width: 2, color: bodyColor });
}
