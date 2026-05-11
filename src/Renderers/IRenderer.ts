import * as PIXI from 'pixi.js';

export interface IRenderer {
    destroy(): void;
    update(): void;
}
