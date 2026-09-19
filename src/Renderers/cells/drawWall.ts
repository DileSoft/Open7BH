import * as PIXI from 'pixi.js';
import { CELL_WIDTH } from '../../PixiRenderer';

export function drawWall(g: PIXI.Graphics, x: number, y: number) {
    // Brick wall
    g.rect(x, y, CELL_WIDTH, CELL_WIDTH);
    g.fill(0x888888);
    g.stroke({ width: 1, color: 0x000000 });
    const bw = 36; // brick width
    const bh = 16; // brick height
    g.stroke({ width: 1, color: 0x666666 });
    for (let row = 0; row < Math.ceil(CELL_WIDTH / bh); row++) {
        const rowY = y + row * bh;
        const offset = (row % 2) * (bw / 2);
        // Horizontal mortar
        g.moveTo(x + 2, rowY);
        g.lineTo(x + CELL_WIDTH - 2, rowY);
        // Vertical mortar (offset every other row)
        for (let col = 0; col <= Math.ceil(CELL_WIDTH / bw) + 1; col++) {
            const brickX = x - bw / 2 + offset + col * bw;
            if (brickX > x + 2 && brickX < x + CELL_WIDTH - 2) {
                g.moveTo(brickX, rowY);
                g.lineTo(brickX, rowY + bh);
            }
        }
    }
    g.stroke({ width: 1, color: 0x000000 });
}
