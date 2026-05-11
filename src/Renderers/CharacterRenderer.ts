import * as PIXI from 'pixi.js';
import Character from '../Classes/Character';
import { IRenderer } from './IRenderer';
import { CELL_WIDTH } from '../PixiRenderer';

export class CharacterRenderer implements IRenderer {
    public container: PIXI.Container;
    private character: Character;
    private charGraphics: PIXI.Graphics;
    private nameText: PIXI.Text;
    private heldItemContainer: PIXI.Container | null = null;

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

    update() {
        this.updatePosition();
        this.updateHeldItem();
        if (this.character.isDead) {
            this.container.alpha = 0.5;
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
