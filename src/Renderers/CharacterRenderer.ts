import * as PIXI from 'pixi.js';
import Character, { CharacterState } from '../Classes/Character';
import { IRenderer } from './IRenderer';
import { CELL_WIDTH, PixiRenderer } from '../PixiRenderer';
import { getCharacterName } from '../levelTranslations';
import { drawBody } from './character/drawBody';
import { drawBubbles } from './character/drawBubbles';
import { applyStateAnimations } from './character/drawAnimations';
import { updateHeldItem } from './character/drawHeldItem';

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
        drawBody(this.charGraphics, character.color);
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

    update(animationSpeed: number) {
        this.animationTime += animationSpeed;
        if (this.character.color !== this.lastColor) {
            this.lastColor = this.character.color;
            drawBody(this.charGraphics, this.character.color);
        }
        this.updatePosition();
        this.heldItemContainer = updateHeldItem(this.character, this.container, this.heldItemContainer);
        drawBubbles(
            this.character,
            this.bubble, this.bubbleBg, this.bubbleText,
            this.listenBubble, this.listenBg, this.listenText,
            this.animationTime,
        );
        applyStateAnimations(this.character, this.charGraphics, this.heldItemContainer, this.animationTime, animationSpeed);

        // Update translated name
        const renderer = PixiRenderer.getInstance();
        this.nameText.text = getCharacterName(this.character.name, renderer.levelName);

        // Smooth movement with fixed step to prevent overshoot and infinite loops
        const dx = this.targetX - this.container.x;
        const dy = this.targetY - this.container.y;

        // Minimum distance to consider "arrived"
        const threshold = 1.0;

        if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
            const moveX = dx * Math.min(1.0, animationSpeed);
            const moveY = dy * Math.min(1.0, animationSpeed);

            this.container.x += moveX;
            this.container.y += moveY;

            this.charGraphics.rotation = 0;
            if (this.character.state === CharacterState.Idle) {
                this.character.setState(CharacterState.Moving);
            }
        } else {
            this.container.x = this.targetX;
            this.container.y = this.targetY;
            this.charGraphics.rotation = 0;

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
