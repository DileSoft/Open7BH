import * as PIXI from 'pixi.js';
import Character, { CharacterState } from '../../Classes/Character';
import { Direction } from '../../Classes/Operators/OperatorStep';

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

export function applyStateAnimations(
    character: Character,
    charGraphics: PIXI.Graphics,
    heldItemContainer: PIXI.Container | null,
    animationTime: number,
    speed: number,
) {
    const dir = directionOffset(character.actionDirection);
    switch (character.state) {
        case CharacterState.Moving: {
            // Walk bounce + lean into movement direction
            charGraphics.y = Math.abs(Math.sin(animationTime * 10)) * -4;
            charGraphics.scale.set(1);
            charGraphics.rotation = dir.x * 0.12;
            if (heldItemContainer) {
                heldItemContainer.y = 5 + Math.sin(animationTime * 10) * 1.5;
                heldItemContainer.x = dir.x * 4;
            }
            break;
        }
        case CharacterState.Taking:
        case CharacterState.PickingUp:
            // Reach up toward the source cell
            charGraphics.y = -4 + Math.sin(animationTime * 8) * 2;
            charGraphics.scale.set(1);
            charGraphics.rotation = 0;
            if (heldItemContainer) {
                heldItemContainer.y = -10 + Math.sin(animationTime * 8) * 2;
                heldItemContainer.x = dir.x * 8;
            }
            break;
        case CharacterState.Dropping:
        case CharacterState.Giving:
            // Bend down / push toward the target cell
            charGraphics.y = 4 + Math.sin(animationTime * 8) * 1.5;
            charGraphics.scale.set(1);
            charGraphics.rotation = 0;
            if (heldItemContainer) {
                heldItemContainer.y = 5;
                heldItemContainer.x = dir.x * 10;
            }
            break;
        case CharacterState.Writing:
            // Scribble shake over the held cube
            charGraphics.y = 0;
            charGraphics.x = Math.sin(animationTime * 30) * 2;
            charGraphics.scale.set(1);
            charGraphics.rotation = 0;
            if (heldItemContainer) {
                heldItemContainer.y = 5;
                heldItemContainer.x = 0;
            }
            break;
        case CharacterState.Calculating:
            // Thinking wobble
            charGraphics.y = Math.sin(animationTime * 4) * 1.5;
            charGraphics.x = 0;
            charGraphics.rotation = Math.sin(animationTime * 4) * 0.1;
            charGraphics.scale.set(1);
            if (heldItemContainer) {
                heldItemContainer.y = 5;
                heldItemContainer.x = 0;
            }
            break;
        case CharacterState.Saying:
            // Lean toward the listener + open bubble (bubble handled in drawBubbles)
            charGraphics.y = -2;
            charGraphics.x = dir.x * 3;
            charGraphics.scale.set(1.05, 1);
            charGraphics.rotation = 0;
            if (heldItemContainer) {
                heldItemContainer.y = 5;
                heldItemContainer.x = 0;
            }
            break;
        case CharacterState.Listening:
            charGraphics.y = Math.sin(animationTime * 2) * 1;
            charGraphics.x = 0;
            charGraphics.scale.set(1);
            charGraphics.rotation = 0;
            break;
        case CharacterState.Idle:
            // Breathing effect, slowed down by speed if speed is low
            charGraphics.y = Math.sin(animationTime * 2) * 2;
            charGraphics.x = 0;
            charGraphics.scale.y = 1 + Math.sin(animationTime * 2) * 0.02;
            charGraphics.rotation = 0;
            if (heldItemContainer) {
                heldItemContainer.y = 5;
                heldItemContainer.x = 0;
            }
            break;
        case CharacterState.Stunned: {
            // Soft exception: shake + tilt + stars
            charGraphics.y = 0;
            charGraphics.x = Math.sin(animationTime * 20) * 3;
            charGraphics.scale.set(1);
            charGraphics.rotation = Math.sin(animationTime * 12) * 0.25;
            if (heldItemContainer) {
                heldItemContainer.y = 5;
                heldItemContainer.x = 0;
            }
            break;
        }
        case CharacterState.Dying:
            charGraphics.rotation += 0.2 * speed * 5;
            break;
        default:
            charGraphics.y = 0;
            charGraphics.x = 0;
            charGraphics.scale.set(1);
            if (heldItemContainer) {
                heldItemContainer.y = 5;
                heldItemContainer.x = 0;
            }
            break;
    }
}
