import * as PIXI from 'pixi.js';
import { CELL_WIDTH } from '../../PixiRenderer';

export function drawHole(g: PIXI.Graphics, x: number, y: number) {
    // Dark pit background
    g.rect(x, y, CELL_WIDTH, CELL_WIDTH);
    g.fill(0x111111);
    g.stroke({ width: 1, color: 0x000000 });
    // Outer ring
    g.ellipse(x + CELL_WIDTH / 2, y + CELL_WIDTH / 2, 30, 30);
    g.fill(0x000000);
    // Inner pit gradient rings
    g.ellipse(x + CELL_WIDTH / 2, y + CELL_WIDTH / 2, 24, 24);
    g.fill(0x1a1a1a);
    g.ellipse(x + CELL_WIDTH / 2, y + CELL_WIDTH / 2, 18, 18);
    g.fill(0x0d0d0d);
    g.ellipse(x + CELL_WIDTH / 2, y + CELL_WIDTH / 2, 10, 10);
    g.fill(0x050505);
}
