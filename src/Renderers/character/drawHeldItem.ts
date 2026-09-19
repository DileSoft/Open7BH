import * as PIXI from 'pixi.js';
import Box from '../../Classes/Box';

export function updateHeldItem(
    character: { item: Box | null },
    container: PIXI.Container,
    heldItemContainer: PIXI.Container | null,
): PIXI.Container | null {
    const item = character.item;
    if (item) {
        if (!heldItemContainer) {
            heldItemContainer = new PIXI.Container();

            const box = new PIXI.Graphics();
            box.rect(-10, -10, 20, 20);
            box.fill(0xdeb887);
            box.stroke({ width: 1, color: 0x000000 });
            heldItemContainer.addChild(box);

            const text = new PIXI.Text({ text: '', style: { fontSize: 10, fill: 0x000000 } });
            text.anchor.set(0.5);
            heldItemContainer.addChild(text);

            container.addChild(heldItemContainer);
            // Position "in hands" (slightly in front and down)
            heldItemContainer.y = 5;
        }

        const text = heldItemContainer.getChildAt(1) as PIXI.Text;
        text.text = item.value.toString();
        heldItemContainer.visible = true;
    } else if (heldItemContainer) {
        heldItemContainer.visible = false;
    }
    return heldItemContainer;
}
