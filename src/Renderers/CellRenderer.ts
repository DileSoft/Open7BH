import * as PIXI from 'pixi.js';
import Cell from '../Classes/Cell';
import Hole from '../Classes/Hole';
import Wall from '../Classes/Wall';
import Printer from '../Classes/Printer';
import Shredder from '../Classes/Shredder';
import { IRenderer } from './IRenderer';
import { CELL_WIDTH } from '../PixiRenderer';

export class CellRenderer implements IRenderer {
    public container: PIXI.Container;
    private graphics: PIXI.Graphics;
    private label: PIXI.Text;
    private sublabel: PIXI.Text;
    private cell: Cell;
    private animationTime = 0;

    constructor(cell: Cell, parent: PIXI.Container) {
        this.cell = cell;
        this.container = new PIXI.Container();
        this.graphics = new PIXI.Graphics();
        this.container.addChild(this.graphics);
        this.label = new PIXI.Text({ text: '', style: { fontSize: 11, fill: 0x000000, fontWeight: 'bold' } });
        this.label.anchor.set(0.5);
        this.label.position.set((cell.x * CELL_WIDTH + CELL_WIDTH / 2), (cell.y * CELL_WIDTH + CELL_WIDTH / 2) - 8);
        this.container.addChild(this.label);
        this.sublabel = new PIXI.Text({ text: '', style: { fontSize: 9, fill: 0x333333 } });
        this.sublabel.anchor.set(0.5);
        this.sublabel.position.set((cell.x * CELL_WIDTH + CELL_WIDTH / 2), (cell.y * CELL_WIDTH + CELL_WIDTH / 2) + 10);
        this.container.addChild(this.sublabel);
        parent.addChild(this.container);
        this.update(0);
    }

    update(animationSpeed: number) {
        this.animationTime += animationSpeed;
        const g = this.graphics;
        g.clear();
        const x = this.cell.x * CELL_WIDTH;
        const y = this.cell.y * CELL_WIDTH;
        let label = '';
        let sublabel = '';

        if (this.cell instanceof Hole) {
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
        } else if (this.cell instanceof Wall) {
            // Brick wall
            g.rect(x, y, CELL_WIDTH, CELL_WIDTH);
            g.fill(0x888888);
            g.stroke({ width: 1, color: 0x000000 });
            const bw = 36; // brick width
            const bh = 16; // brick height
            const mortar = 2;
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
        } else if (this.cell instanceof Printer) {
            const pulse = 0.5 + Math.sin(this.animationTime * 4) * 0.5;
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
            label = '';
            const printer = this.cell as Printer;
            sublabel = printer.fixedValue !== undefined
                ? `${printer.fixedValue}`
                : `${printer.min}..${printer.max}`;
        } else if (this.cell instanceof Shredder) {
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
            const rot1 = this.animationTime * 3;
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
                const wobble = Math.sin(this.animationTime * 5 + i) * 2;
                g.rect(stripX + wobble, sy + sh + 2, 4, 10 + Math.sin(this.animationTime * 3 + i * 2) * 3);
                g.fill(0xffffff);
            }
            // Red LED
            g.circle(sx + sw - 8, sy + sh - 8, 3);
            g.fill(0xff4444);
            g.stroke({ width: 0.5, color: 0x991111 });
            label = '';
        }

        this.label.text = label;
        this.sublabel.text = sublabel;
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
