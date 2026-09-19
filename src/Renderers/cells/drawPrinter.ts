import * as PIXI from 'pixi.js';
import { CELL_WIDTH } from '../../PixiRenderer';

export function drawPrinter(g: PIXI.Graphics, x: number, y: number, animationTime: number) {
    const pulse = 0.5 + Math.sin(animationTime * 4) * 0.5;
    // Background
    g.rect(x, y, CELL_WIDTH, CELL_WIDTH);
    g.fill(0x00cc44);
    g.stroke({ width: 1, color: 0x000000 });
    // Printer body (rounded rect)
    const bx = x + 14, by = y + 22, bw = 52, bh = 38;
    g.roundRect(bx, by, bw, bh, 4);
    g.fill(0xe8e8e8);
    g.stroke({ width: 1.5, color: 0x555555 });
    // Paper slot (dark slit at top of body)
    g.roundRect(bx + 6, by + 2, bw - 12, 5, 2);
    g.fill(0x444444);
    // Paper coming out
    g.rect(bx + 10, by - 10, bw - 20, 14);
    g.fill(0xffffff);
    g.stroke({ width: 1, color: 0xbbbbbb });
    // Box icon on paper
    const boxSize = 8;
    g.rect(bx + bw / 2 - boxSize / 2, by - 8, boxSize, boxSize);
    g.fill(0x00aa33);
    g.stroke({ width: 1, color: 0x006622 });
    // Green LED
    g.circle(bx + bw - 8, by + bh - 8, 3);
    g.fill(0x00ff66);
    g.stroke({ width: 0.5, color: 0x009933 });
    // Pulsing glow around LED
    g.circle(bx + bw - 8, by + bh - 8, 5 + pulse * 2);
    g.fill({ color: 0x00ff66, alpha: 0.15 + pulse * 0.15 });
    // Output tray
    g.rect(bx + 8, by + bh - 2, bw - 16, 4);
    g.fill(0xdddddd);
    g.stroke({ width: 0.5, color: 0x999999 });
}
