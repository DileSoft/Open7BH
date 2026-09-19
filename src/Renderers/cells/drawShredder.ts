import * as PIXI from 'pixi.js';
import { CELL_WIDTH } from '../../PixiRenderer';

export function drawShredder(g: PIXI.Graphics, x: number, y: number, animationTime: number) {
    // Background
    g.rect(x, y, CELL_WIDTH, CELL_WIDTH);
    g.fill(0xcc2222);
    g.stroke({ width: 1, color: 0x000000 });
    // Shredder body
    const sx = x + 12, sy = y + 14, sw = 56, sh = 48;
    g.roundRect(sx, sy, sw, sh, 4);
    g.fill(0xdddddd);
    g.stroke({ width: 1.5, color: 0x555555 });
    // Paper slot at top
    g.roundRect(sx + 6, sy + 2, sw - 12, 6, 2);
    g.fill(0x333333);
    // Paper going in (partially torn)
    g.rect(sx + 14, sy - 8, sw - 28, 12);
    g.fill(0xffffff);
    g.stroke({ width: 1, color: 0xbbbbbb });
    // Torn paper lines
    const tearX = sx + sw / 2;
    g.moveTo(tearX, sy - 8);
    g.lineTo(tearX - 1, sy + 2);
    g.stroke({ width: 0.5, color: 0x999999 });
    // Two counter-rotating cylinders
    const cy1 = sy + 18;
    const cy2 = sy + 28;
    // Cylinder 1
    g.roundRect(sx + 8, cy1, sw - 16, 8, 3);
    g.fill(0x888888);
    g.stroke({ width: 1, color: 0x555555 });
    // Teeth on cylinder 1
    const rot1 = animationTime * 3;
    for (let i = 0; i < 6; i++) {
        const angle = rot1 + i * Math.PI / 3;
        const tx = sx + sw / 2 + Math.cos(angle) * (sw / 2 - 10);
        const ty = cy1 + 4 + Math.sin(angle) * 3;
        g.circle(tx, ty, 2);
        g.fill(0x666666);
    }
    // Cylinder 2
    g.roundRect(sx + 8, cy2, sw - 16, 8, 3);
    g.fill(0x777777);
    g.stroke({ width: 1, color: 0x555555 });
    // Teeth on cylinder 2 (counter-rotating)
    for (let i = 0; i < 6; i++) {
        const angle = -rot1 + i * Math.PI / 3;
        const tx = sx + sw / 2 + Math.cos(angle) * (sw / 2 - 10);
        const ty = cy2 + 4 + Math.sin(angle) * 3;
        g.circle(tx, ty, 2);
        g.fill(0x555555);
    }
    // Paper strips falling out bottom
    g.fill(0xffffff);
    for (let i = 0; i < 4; i++) {
        const stripX = sx + 14 + i * 10;
        const wobble = Math.sin(animationTime * 5 + i) * 2;
        g.rect(stripX + wobble, sy + sh + 2, 4, 10 + Math.sin(animationTime * 3 + i * 2) * 3);
        g.fill(0xffffff);
    }
    // Red LED
    g.circle(sx + sw - 8, sy + sh - 8, 3);
    g.fill(0xff4444);
    g.stroke({ width: 0.5, color: 0x991111 });
}
