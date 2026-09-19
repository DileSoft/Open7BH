import * as PIXI from 'pixi.js';
import Character from '../../Classes/Character';

export function drawBubbles(
    character: Character,
    bubble: PIXI.Container,
    bubbleBg: PIXI.Graphics,
    bubbleText: PIXI.Text,
    listenBubble: PIXI.Container,
    listenBg: PIXI.Graphics,
    listenText: PIXI.Text,
    animationTime: number,
) {
    const now = Date.now();
    let text = '';
    if (character.lastSaidText && now < character.lastSaidUntil) {
        text = character.lastSaidText;
    } else if (character.lastCalcText && now < character.lastCalcUntil) {
        text = character.lastCalcText;
    }
    if (text) {
        bubble.visible = true;
        bubbleText.text = text;
        const w = Math.min(130, Math.max(40, bubbleText.width + 14));
        const h = bubbleText.height + 12;
        bubbleBg.clear();
        bubbleBg.roundRect(-w / 2, -h / 2, w, h, 6);
        bubbleBg.fill(0xffffff);
        bubbleBg.stroke({ width: 1, color: 0x000000 });
        // Bubble tail
        bubbleBg.moveTo(-8, h / 2);
        bubbleBg.lineTo(-14, h / 2 + 8);
        bubbleBg.lineTo(-2, h / 2);
        bubbleBg.fill(0xffffff);
    } else {
        bubble.visible = false;
    }

    if (character.hear !== undefined && !character.isTerminated && !character.isDead) {
        listenBubble.visible = true;
        const waiting = character.hear === '' ? '(any)' : character.hear;
        listenText.text = `hear: ${waiting}`;
        const w = Math.min(140, Math.max(50, listenText.width + 16));
        const h = listenText.height + 10;
        listenBg.clear();
        listenBg.roundRect(-w / 2, -h / 2, w, h, 6);
        listenBg.fill({ color: 0xffffcc, alpha: 0.9 + Math.sin(animationTime * 6) * 0.1 });
        listenBg.stroke({ width: 1, color: 0x999900 });
        // Ear icon dot
        listenBg.circle(-w / 2 + 8, 0, 3);
        listenBg.fill(0x999900);
    } else {
        listenBubble.visible = false;
    }
}
