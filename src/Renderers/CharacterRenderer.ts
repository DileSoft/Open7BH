import * as PIXI from 'pixi.js';
import Character, { CharacterState } from '../Classes/Character';
import { Direction } from '../Classes/Operators/OperatorStep';
import { IRenderer } from './IRenderer';
import { CELL_WIDTH, PixiRenderer } from '../PixiRenderer';

const directionOffset = (direction: Direction | null | undefined): { x: number; y: number } => {
    switch (direction) {
        case Direction.Up: return { x: 0, y: -1 };
        case Direction.Down: return { x: 0, y: 1 };
        case Direction.Left: return { x: -1, y: 0 };
        case Direction.Right: return { x: 1, y: 0 };
        case Direction.UpLeft: return { x: -0.7, y: -0.7 };
        case Direction.UpRight: return { x: 0.7, y: -0.7 };
        case Direction.DownLeft: return { x: -0.7, y: 0.7 };
        case Direction.DownRight: return { x: 0.7, y: 0.7 };
        default: return { x: 0, y: 0 };
    }
};

export class CharacterRenderer implements IRenderer {
    public container: PIXI.Container;
    private character: Character;
    private charGraphics: PIXI.Graphics;
    private nameText: PIXI.Text;
    private heldItemContainer: PIXI.Container | null = null;
    private animationTime: number = 0;
    private lastColor = '';
    private bubble: PIXI.Container;
    private bubbleBg: PIXI.Graphics;
    private bubbleText: PIXI.Text;
    private listenBubble: PIXI.Container;
    private listenBg: PIXI.Graphics;
    private listenText: PIXI.Text;

    public targetX: number = 0;
    public targetY: number = 0;

    constructor(character: Character, parent: PIXI.Container) {
        this.character = character;
        this.container = new PIXI.Container();

        this.charGraphics = new PIXI.Graphics();
        this.lastColor = character.color;
        this.drawBody();
        this.container.addChild(this.charGraphics);

        this.nameText = new PIXI.Text({ text: character.name, style: { fontSize: 12, fill: 0x000000 } });
        this.nameText.anchor.set(0.5, 0);
        this.nameText.y = 30;
        this.container.addChild(this.nameText);

        this.bubble = new PIXI.Container();
        this.bubbleBg = new PIXI.Graphics();
        this.bubbleText = new PIXI.Text({ text: '', style: { fontSize: 11, fill: 0x000000, wordWrap: true, wordWrapWidth: 120 } });
        this.bubbleText.anchor.set(0.5);
        this.bubble.addChild(this.bubbleBg);
        this.bubble.addChild(this.bubbleText);
        this.bubble.position.set(44, -18);
        this.bubble.visible = false;
        this.container.addChild(this.bubble);

        this.listenBubble = new PIXI.Container();
        this.listenBg = new PIXI.Graphics();
        this.listenText = new PIXI.Text({ text: '', style: { fontSize: 11, fill: 0x333333, fontWeight: 'bold' } });
        this.listenText.anchor.set(0.5);
        this.listenBubble.addChild(this.listenBg);
        this.listenBubble.addChild(this.listenText);
        this.listenBubble.position.set(0, -18);
        this.listenBubble.visible = false;
        this.container.addChild(this.listenBubble);

        parent.addChild(this.container);
        this.updatePosition(true);
    }

    private drawBody() {
        const bodyColor = PixiRenderer.colorToHex(this.character.color);
        this.charGraphics.clear();
        this.charGraphics.circle(0, -15, 12);
        this.charGraphics.fill(0xffc0cb);
        this.charGraphics.circle(-4, -17, 1.5);
        this.charGraphics.circle(4, -17, 1.5);
        this.charGraphics.fill(0x000000);
        this.charGraphics.ellipse(0, 10, 15, 20);
        this.charGraphics.fill(bodyColor);
        // Chest badge in character color outline, white fill
        this.charGraphics.circle(0, 10, 5);
        this.charGraphics.fill(0xffffff);
        this.charGraphics.stroke({ width: 2, color: bodyColor });
    }

    update(animationSpeed: number) {
        // Use the global speed to advance animation time
        this.animationTime += animationSpeed;
        if (this.character.color !== this.lastColor) {
            this.lastColor = this.character.color;
            this.drawBody();
        }
        this.updatePosition();
        this.updateHeldItem();
        this.updateBubbles();
        this.applyStateAnimations(animationSpeed);

        // Smooth movement with fixed step to prevent overshoot and infinite loops
        const dx = this.targetX - this.container.x;
        const dy = this.targetY - this.container.y;

        // Minimum distance to consider "arrived"
        const threshold = 1.0;

        if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
            // Use a constant-ish interpolation that respects animationSpeed
            // but also ensures we actually close the gap.
            // If animationSpeed is high (e.g. 1.0+), it might jump too far.
            // We clamp the movement to not overshoot the target.
            const moveX = dx * Math.min(1.0, animationSpeed);
            const moveY = dy * Math.min(1.0, animationSpeed);

            this.container.x += moveX;
            this.container.y += moveY;

            this.charGraphics.rotation = 0;
            // Force state to Moving if we are still far from target
            if (this.character.state === CharacterState.Idle) {
                this.character.setState(CharacterState.Moving);
            }
        } else {
            // Snap to exact target to avoid floating point drift
            this.container.x = this.targetX;
            this.container.y = this.targetY;
            this.charGraphics.rotation = 0;

            // If we arrived at target and were moving, go back to idle
            if (this.character.state === CharacterState.Moving) {
                this.character.setState(CharacterState.Idle);
            }
        }

        if (this.character.isDead) {
            this.container.alpha = Math.max(0, this.container.alpha - 0.02 * animationSpeed * 5);
            this.container.scale.set(Math.max(0, this.container.scale.x - 0.02 * animationSpeed * 5));
        } else {
            this.container.alpha = 1;
            if (this.container.scale.x === 0) this.container.scale.set(1);
        }
    }

    private updateBubbles() {
        const now = Date.now();
        let bubbleText = '';
        if (this.character.lastSaidText && now < this.character.lastSaidUntil) {
            bubbleText = this.character.lastSaidText;
        } else if (this.character.lastCalcText && now < this.character.lastCalcUntil) {
            bubbleText = this.character.lastCalcText;
        }
        if (bubbleText) {
            this.bubble.visible = true;
            this.bubbleText.text = bubbleText;
            const w = Math.min(130, Math.max(40, this.bubbleText.width + 14));
            const h = this.bubbleText.height + 12;
            this.bubbleBg.clear();
            this.bubbleBg.roundRect(-w / 2, -h / 2, w, h, 6);
            this.bubbleBg.fill(0xffffff);
            this.bubbleBg.stroke({ width: 1, color: 0x000000 });
            // Bubble tail
            this.bubbleBg.moveTo(-8, h / 2);
            this.bubbleBg.lineTo(-14, h / 2 + 8);
            this.bubbleBg.lineTo(-2, h / 2);
            this.bubbleBg.fill(0xffffff);
        } else {
            this.bubble.visible = false;
        }

        if (this.character.hear !== undefined && !this.character.isTerminated && !this.character.isDead) {
            this.listenBubble.visible = true;
            const waiting = this.character.hear === '' ? '(any)' : this.character.hear;
            this.listenText.text = `hear: ${waiting}`;
            const w = Math.min(140, Math.max(50, this.listenText.width + 16));
            const h = this.listenText.height + 10;
            this.listenBg.clear();
            this.listenBg.roundRect(-w / 2, -h / 2, w, h, 6);
            this.listenBg.fill({ color: 0xffffcc, alpha: 0.9 + Math.sin(this.animationTime * 6) * 0.1 });
            this.listenBg.stroke({ width: 1, color: 0x999900 });
            // Ear icon dot
            this.listenBg.circle(-w / 2 + 8, 0, 3);
            this.listenBg.fill(0x999900);
        } else {
            this.listenBubble.visible = false;
        }
    }

    private applyStateAnimations(speed: number) {
        // speed here is the current ANIMATION_SPEED from PixiRenderer
        // which typically corresponds to the value from the 'speed' input
        const dir = directionOffset(this.character.actionDirection);
        switch (this.character.state) {
            case CharacterState.Moving: {
                // Walk bounce + lean into movement direction
                this.charGraphics.y = Math.abs(Math.sin(this.animationTime * 10)) * -4;
                this.charGraphics.scale.set(1);
                this.charGraphics.rotation = dir.x * 0.12;
                if (this.heldItemContainer) {
                    this.heldItemContainer.y = 5 + Math.sin(this.animationTime * 10) * 1.5;
                    this.heldItemContainer.x = dir.x * 4;
                }
                break;
            }
            case CharacterState.Taking:
            case CharacterState.PickingUp:
                // Reach up toward the source cell
                this.charGraphics.y = -4 + Math.sin(this.animationTime * 8) * 2;
                this.charGraphics.scale.set(1);
                this.charGraphics.rotation = 0;
                if (this.heldItemContainer) {
                    this.heldItemContainer.y = -10 + Math.sin(this.animationTime * 8) * 2;
                    this.heldItemContainer.x = dir.x * 8;
                }
                break;
            case CharacterState.Dropping:
            case CharacterState.Giving:
                // Bend down / push toward the target cell
                this.charGraphics.y = 4 + Math.sin(this.animationTime * 8) * 1.5;
                this.charGraphics.scale.set(1);
                this.charGraphics.rotation = 0;
                if (this.heldItemContainer) {
                    this.heldItemContainer.y = 5;
                    this.heldItemContainer.x = dir.x * 10;
                }
                break;
            case CharacterState.Writing:
                // Scribble shake over the held cube
                this.charGraphics.y = 0;
                this.charGraphics.x = Math.sin(this.animationTime * 30) * 2;
                this.charGraphics.scale.set(1);
                this.charGraphics.rotation = 0;
                if (this.heldItemContainer) {
                    this.heldItemContainer.y = 5;
                    this.heldItemContainer.x = 0;
                }
                break;
            case CharacterState.Calculating:
                // Thinking wobble
                this.charGraphics.y = Math.sin(this.animationTime * 4) * 1.5;
                this.charGraphics.x = 0;
                this.charGraphics.rotation = Math.sin(this.animationTime * 4) * 0.1;
                this.charGraphics.scale.set(1);
                if (this.heldItemContainer) {
                    this.heldItemContainer.y = 5;
                    this.heldItemContainer.x = 0;
                }
                break;
            case CharacterState.Saying:
                // Lean toward the listener + open bubble (bubble handled in updateBubbles)
                this.charGraphics.y = -2;
                this.charGraphics.x = dir.x * 3;
                this.charGraphics.scale.set(1.05, 1);
                this.charGraphics.rotation = 0;
                if (this.heldItemContainer) {
                    this.heldItemContainer.y = 5;
                    this.heldItemContainer.x = 0;
                }
                break;
            case CharacterState.Listening:
                this.charGraphics.y = Math.sin(this.animationTime * 2) * 1;
                this.charGraphics.x = 0;
                this.charGraphics.scale.set(1);
                this.charGraphics.rotation = 0;
                break;
            case CharacterState.Idle:
                // Breathing effect, slowed down by speed if speed is low
                this.charGraphics.y = Math.sin(this.animationTime * 2) * 2;
                this.charGraphics.x = 0;
                this.charGraphics.scale.y = 1 + Math.sin(this.animationTime * 2) * 0.02;
                this.charGraphics.rotation = 0;
                if (this.heldItemContainer) {
                    this.heldItemContainer.y = 5;
                    this.heldItemContainer.x = 0;
                }
                break;
            case CharacterState.Stunned: {
                // Soft exception: shake + tilt + stars
                this.charGraphics.y = 0;
                this.charGraphics.x = Math.sin(this.animationTime * 20) * 3;
                this.charGraphics.scale.set(1);
                this.charGraphics.rotation = Math.sin(this.animationTime * 12) * 0.25;
                if (this.heldItemContainer) {
                    this.heldItemContainer.y = 5;
                    this.heldItemContainer.x = 0;
                }
                break;
            }
            case CharacterState.Dying:
                this.charGraphics.rotation += 0.2 * speed * 5;
                break;
            default:
                this.charGraphics.y = 0;
                this.charGraphics.x = 0;
                this.charGraphics.scale.set(1);
                if (this.heldItemContainer) {
                    this.heldItemContainer.y = 5;
                    this.heldItemContainer.x = 0;
                }
                break;
        }
    }

    private updateHeldItem() {
        const item = this.character.item;
        if (item) {
            if (!this.heldItemContainer) {
                this.heldItemContainer = new PIXI.Container();
                
                const box = new PIXI.Graphics();
                box.rect(-10, -10, 20, 20);
                box.fill(0xdeb887);
                box.stroke({ width: 1, color: 0x000000 });
                this.heldItemContainer.addChild(box);

                const text = new PIXI.Text({ text: '', style: { fontSize: 10, fill: 0x000000 } });
                text.anchor.set(0.5);
                this.heldItemContainer.addChild(text);
                
                this.container.addChild(this.heldItemContainer);
                // Position "in hands" (slightly in front and down)
                this.heldItemContainer.y = 5;
            }
            
            const text = this.heldItemContainer.getChildAt(1) as PIXI.Text;
            text.text = item.value.toString();
            this.heldItemContainer.visible = true;
        } else if (this.heldItemContainer) {
            this.heldItemContainer.visible = false;
        }
    }

    private updatePosition(immediate = false) {
        this.targetX = this.character.cell.x * CELL_WIDTH + CELL_WIDTH / 2;
        this.targetY = this.character.cell.y * CELL_WIDTH + CELL_WIDTH / 2;
        
        if (immediate) {
            this.container.x = this.targetX;
            this.container.y = this.targetY;
        }
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
