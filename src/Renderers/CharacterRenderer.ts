import * as PIXI from 'pixi.js';
import Character, { CharacterState } from '../Classes/Character';
import { IRenderer } from './IRenderer';
import { CELL_WIDTH } from '../PixiRenderer';

export class CharacterRenderer implements IRenderer {
    public container: PIXI.Container;
    private character: Character;
    private charGraphics: PIXI.Graphics;
    private nameText: PIXI.Text;
    private heldItemContainer: PIXI.Container | null = null;
    private animationTime: number = 0;

    public targetX: number = 0;
    public targetY: number = 0;

    constructor(character: Character, parent: PIXI.Container) {
        this.character = character;
        this.container = new PIXI.Container();
        
        this.charGraphics = new PIXI.Graphics();
        this.drawBody();
        this.container.addChild(this.charGraphics);

        this.nameText = new PIXI.Text({ text: character.name, style: { fontSize: 12, fill: 0x000000 } });
        this.nameText.anchor.set(0.5, 0);
        this.nameText.y = 30;
        this.container.addChild(this.nameText);

        parent.addChild(this.container);
        this.updatePosition(true);
    }

    private drawBody() {
        this.charGraphics.clear();
        this.charGraphics.circle(0, -15, 12); 
        this.charGraphics.fill(0xffc0cb);
        this.charGraphics.circle(-4, -17, 1.5);
        this.charGraphics.circle(4, -17, 1.5);
        this.charGraphics.fill(0x000000);
        this.charGraphics.ellipse(0, 10, 15, 20);
        this.charGraphics.fill(this.character.color === 'green' ? 0x00ff00 : 0x0000ff);
    }

    update(animationSpeed: number) {
        // Use the global speed to advance animation time
        this.animationTime += animationSpeed;
        this.updatePosition();
        this.updateHeldItem();
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
        }
    }

    private applyStateAnimations(speed: number) {
        // speed here is the current ANIMATION_SPEED from PixiRenderer
        // which typically corresponds to the value from the 'speed' input
        switch (this.character.state) {
            case CharacterState.Taking:
            case CharacterState.PickingUp:
                // Smooth lift animation for taking
                this.charGraphics.y = -Math.abs(Math.sin(this.animationTime * 5) * 4);
                if (this.heldItemContainer) {
                    this.heldItemContainer.y = -10 + Math.sin(this.animationTime * 5) * 5;
                }
                break;
            case CharacterState.Dropping:
            case CharacterState.Giving:
                // Smooth lowering animation for giving/dropping
                this.charGraphics.y = Math.abs(Math.sin(this.animationTime * 5) * 4);
                if (this.heldItemContainer) {
                    this.heldItemContainer.y = -5 + Math.abs(Math.sin(this.animationTime * 5) * 8);
                }
                break;
            case CharacterState.Idle:
                // Breathing effect, slowed down by speed if speed is low
                this.charGraphics.y = Math.sin(this.animationTime * 2) * 2;
                this.charGraphics.scale.y = 1 + Math.sin(this.animationTime * 2) * 0.02;
                break;
            case CharacterState.Dying:
                this.charGraphics.rotation += 0.2 * speed * 5;
                break;
            default:
                this.charGraphics.y = 0;
                this.charGraphics.scale.set(1);
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
