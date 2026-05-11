import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GameSerialized } from './Classes/Game';

interface OperationBlock {
    index: number;
    graphics: PIXI.Container;
    text: PIXI.Text;
    background: PIXI.Graphics;
    x: number;
    y: number;
    width: number;
    height: number;
    isDragging?: boolean;
    offsetY?: number;
    operatorId?: string; // Store operator reference
}

class PixiCodeEditorRenderer {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static instance: PixiCodeEditorRenderer | null = null;

    app: PIXI.Application | null = null;

    container: PIXI.Container | null = null;

    operationBlocks: OperationBlock[] = [];

    draggedBlock: OperationBlock | null = null;

    dragOffsetY = 0;

    game: GameSerialized | null = null;

    private initialized = false;

    readonly BLOCK_WIDTH = 200;

    readonly BLOCK_HEIGHT = 50;

    readonly PADDING_X = 20;

    readonly PADDING_Y = 20;

    readonly BLOCK_SPACING = 10;

    readonly BACKGROUND_COLOR = 0x4a90e2;
    
    readonly BACKGROUND_COLOR_HOVER = 0x357abd;
    
    readonly BACKGROUND_COLOR_DRAG = 0x1a3a5c;
    
    readonly TEXT_COLOR = 0xffffff;
    
    // Operator type colors
    readonly COLOR_CALC = 0x2ecc71;
    readonly COLOR_PICKUP = 0x3498db;
    readonly COLOR_DROP = 0xe74c3c;
    readonly COLOR_END = 0xf39c12;
    readonly COLOR_FOREACH = 0x9b59b6;
    readonly COLOR_ENDFOREACH = 0x9b59b6;
    readonly COLOR_GIVE = 0xe67e22;
    readonly COLOR_GOTO = 0x1abc9c;
    readonly COLOR_HEAR = 0x34495e;
    readonly COLOR_IF = 0xe74c3c;
    readonly COLOR_ENDIF = 0xe74c3c;
    readonly COLOR_NEAR = 0x16a085;
    readonly COLOR_SAY = 0x27ae60;
    readonly COLOR_STEP = 0x2980b9;
    readonly COLOR_TAKE = 0x8e44ad;
    readonly COLOR_VARIABLE = 0x7f8c8d;
    readonly COLOR_WRITE = 0x2c3e50;

    public static getInstance(): PixiCodeEditorRenderer {
        if (!PixiCodeEditorRenderer.instance) {
            PixiCodeEditorRenderer.instance = new PixiCodeEditorRenderer();
        }
        return PixiCodeEditorRenderer.instance;
    }

    async init(canvas: HTMLCanvasElement) {
        if (this.initialized && this.app) {
            if (this.app.canvas !== canvas) {
                this.app.destroy(true, { children: true, texture: true });
                this.operationBlocks = [];
                this.draggedBlock = null;
                this.initialized = false;
            } else {
                return;
            }
        }

        this.app = new PIXI.Application();
        await this.app.init({
            canvas,
            width: 800,
            height: 600,
            backgroundColor: 0xeeeeee,
            antialias: true,
        });

        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);

        // Setup event listeners
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.app.canvas.addEventListener('pointerdown', this.onPointerDown as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.app.canvas.addEventListener('pointermove', this.onPointerMove as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.app.canvas.addEventListener('pointerup', this.onPointerUp as any);

        this.initialized = true;
    }

    private getCanvasCoordinates(clientX: number, clientY: number): { x: number; y: number } {
        if (!this.app) return { x: 0, y: 0 };
        const rect = this.app.canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left) * (this.app.canvas.width / rect.width),
            y: (clientY - rect.top) * (this.app.canvas.height / rect.height),
        };
    }

    private onPointerDown = (e: PointerEvent) => {
        const coords = this.getCanvasCoordinates(e.clientX, e.clientY);

        for (const block of this.operationBlocks) {
            if (
                coords.x >= block.x &&
                coords.x <= block.x + block.width &&
                coords.y >= block.y &&
                coords.y <= block.y + block.height
            ) {
                this.draggedBlock = block;
                this.dragOffsetY = coords.y - block.y;
                block.isDragging = true;
                block.background.tint = this.BACKGROUND_COLOR_DRAG;
                return;
            }
        }
    };

    private onPointerMove = (e: PointerEvent) => {
        if (!this.draggedBlock) {
            // Check for hover
            const coords = this.getCanvasCoordinates(e.clientX, e.clientY);
            for (const block of this.operationBlocks) {
                const isHover = coords.x >= block.x &&
                    coords.x <= block.x + block.width &&
                    coords.y >= block.y &&
                    coords.y <= block.y + block.height;

                if (isHover && !block.isDragging) {
                    block.background.tint = this.BACKGROUND_COLOR_HOVER;
                } else if (!isHover && !block.isDragging) {
                    block.background.tint = this.BACKGROUND_COLOR;
                }
            }
            return;
        }

        const coords = this.getCanvasCoordinates(e.clientX, e.clientY);
        const newY = coords.y - this.dragOffsetY;

        // Update drag position
        this.draggedBlock.y = newY;
        this.draggedBlock.graphics.y = newY;

        // Find which block to swap with
        const draggedIndex = this.draggedBlock.index;
        for (let i = 0; i < this.operationBlocks.length; i++) {
            const block = this.operationBlocks[i];
            if (block === this.draggedBlock) continue;

            const blockCenterY = block.y + block.height / 2;

            // Swap if dragged block crosses center of another block
            if (
                this.draggedBlock.y + this.draggedBlock.height / 2 < blockCenterY &&
                draggedIndex > i
            ) {
                // Moving up
                [this.operationBlocks[draggedIndex], this.operationBlocks[i]] = [
                    this.operationBlocks[i],
                    this.operationBlocks[draggedIndex],
                ];
                this.operationBlocks[draggedIndex].index = draggedIndex;
                this.operationBlocks[i].index = i;
                this.draggedBlock.index = i;
                break;
            } else if (
                this.draggedBlock.y + this.draggedBlock.height / 2 > blockCenterY &&
                draggedIndex < i
            ) {
                // Moving down
                [this.operationBlocks[draggedIndex], this.operationBlocks[i]] = [
                    this.operationBlocks[i],
                    this.operationBlocks[draggedIndex],
                ];
                this.operationBlocks[draggedIndex].index = draggedIndex;
                this.operationBlocks[i].index = i;
                this.draggedBlock.index = i;
                break;
            }
        }
    };

    private onPointerUp = () => {
        if (this.draggedBlock && this.game && this.game.object) {
            // Update game code order based on current block order
            const gameObject = this.game.object;
            const originalCode = [...gameObject.code];

            // Build new code order from blocks
            const newCode = this.operationBlocks
                .map(block => {
                    // Find operator by id if available
                    if (block.operatorId) {
                        return originalCode.find(op => op.id === block.operatorId);
                    }
                    return undefined;
                })
                .filter(x => x !== undefined) as typeof gameObject.code;

            gameObject.code = newCode;
            gameObject.render();

            this.draggedBlock.background.tint = this.BACKGROUND_COLOR;
            this.draggedBlock.isDragging = false;
            this.draggedBlock = null;
            this.relayoutBlocks();
        }
    };

    render(game: GameSerialized) {
        if (!game || !game.object || !this.app || !this.container) return;

        this.game = game;

        const code = game.code || game.object.code.map(op => ({ type: op.constructor.name, object: op }));

        // Clear if code length changed
        if (this.operationBlocks.length !== code.length) {
            this.container.removeChildren();
            this.operationBlocks = [];
        }

        // Create or update blocks
        code.forEach((operator, index) => {
            let block = this.operationBlocks[index];

            if (!block) {
                const blockContainer = new PIXI.Container();
                const background = new PIXI.Graphics();
                // Get type from operator - it should be OperatorSerialized with type
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const operatorType = operator.type || 'Operation';
                
                // Determine color based on operator type
                let color = this.BACKGROUND_COLOR;
                if (operatorType === 'CALC') {
                    color = this.COLOR_CALC;
                } else if (operatorType === 'PICKUP') {
                    color = this.COLOR_PICKUP;
                } else if (operatorType === 'DROP') {
                    color = this.COLOR_DROP;
                } else if (operatorType === 'END') {
                    color = this.COLOR_END;
                } else if (operatorType === 'FOREACH') {
                    color = this.COLOR_FOREACH;
                } else if (operatorType === 'ENDFOREACH') {
                    color = this.COLOR_ENDFOREACH;
                } else if (operatorType === 'GIVE') {
                    color = this.COLOR_GIVE;
                } else if (operatorType === 'GOTO') {
                    color = this.COLOR_GOTO;
                } else if (operatorType === 'HEAR') {
                    color = this.COLOR_HEAR;
                } else if (operatorType === 'IF') {
                    color = this.COLOR_IF;
                } else if (operatorType === 'ENDIF') {
                    color = this.COLOR_ENDIF;
                } else if (operatorType === 'NEAR') {
                    color = this.COLOR_NEAR;
                } else if (operatorType === 'SAY') {
                    color = this.COLOR_SAY;
                } else if (operatorType === 'STEP') {
                    color = this.COLOR_STEP;
                } else if (operatorType === 'TAKE') {
                    color = this.COLOR_TAKE;
                } else if (operatorType === 'VARIABLE') {
                    color = this.COLOR_VARIABLE;
                } else if (operatorType === 'WRITE') {
                    color = this.COLOR_WRITE;
                }

                const text = new PIXI.Text({
                    text: String(operatorType).toUpperCase() + 1,
                    style: {
                        fontSize: 16,
                        fill: this.TEXT_COLOR,
                        fontWeight: 'bold',
                    },
                });

                text.anchor.set(0.5);
                blockContainer.addChild(background);
                blockContainer.addChild(text);
                if (this.container) {
                    this.container.addChild(blockContainer);
                }

                block = {
                    index,
                    graphics: blockContainer,
                    text,
                    background,
                    x: this.PADDING_X,
                    y: 0,
                    width: this.BLOCK_WIDTH,
                    height: this.BLOCK_HEIGHT,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    operatorId: (operator as any).object?.id,
                };

                this.operationBlocks[index] = block;
            } else {
                // Get type from operator - it should be OperatorSerialized with type
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const operatorType = (operator as any).type || 'Operation';
                block.text.text = String(operatorType).toUpperCase();
                block.index = index;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                block.operatorId = (operator as any).object?.id;
                
                // Update color based on operator type
                let color = this.BACKGROUND_COLOR;
                if (operatorType === 'CALC') {
                    color = this.COLOR_CALC;
                } else if (operatorType === 'PICKUP') {
                    color = this.COLOR_PICKUP;
                } else if (operatorType === 'DROP') {
                    color = this.COLOR_DROP;
                } else if (operatorType === 'END') {
                    color = this.COLOR_END;
                } else if (operatorType === 'FOREACH') {
                    color = this.COLOR_FOREACH;
                } else if (operatorType === 'ENDFOREACH') {
                    color = this.COLOR_ENDFOREACH;
                } else if (operatorType === 'GIVE') {
                    color = this.COLOR_GIVE;
                } else if (operatorType === 'GOTO') {
                    color = this.COLOR_GOTO;
                } else if (operatorType === 'HEAR') {
                    color = this.COLOR_HEAR;
                } else if (operatorType === 'IF') {
                    color = this.COLOR_IF;
                } else if (operatorType === 'ENDIF') {
                    color = this.COLOR_ENDIF;
                } else if (operatorType === 'NEAR') {
                    color = this.COLOR_NEAR;
                } else if (operatorType === 'SAY') {
                    color = this.COLOR_SAY;
                } else if (operatorType === 'STEP') {
                    color = this.COLOR_STEP;
                } else if (operatorType === 'TAKE') {
                    color = this.COLOR_TAKE;
                } else if (operatorType === 'VARIABLE') {
                    color = this.COLOR_VARIABLE;
                } else if (operatorType === 'WRITE') {
                    color = this.COLOR_WRITE;
                }
            }
        });

        this.relayoutBlocks();
    }

    private relayoutBlocks() {
        let currentY = this.PADDING_Y;

        for (const block of this.operationBlocks) {
            // Only update Y if not currently being dragged
            if (!block.isDragging) {
                block.y = currentY;
                block.graphics.y = currentY;
            }

            console.log(block)

            // Get operator type to determine color
            const operatorType = this.game?.object?.code?.find(op => op.id === block.operatorId)
            console.log(operatorType)
            const type = operatorType.constructor.name.replace('Operator', '').toUpperCase();
            
            // Determine color based on operator type
            let color = this.BACKGROUND_COLOR;
            if (type === 'CALC') {
                color = this.COLOR_CALC;
            } else if (type === 'PICKUP') {
                color = this.COLOR_PICKUP;
            } else if (type === 'DROP') {
                color = this.COLOR_DROP;
            } else if (type === 'END') {
                color = this.COLOR_END;
            } else if (type === 'FOREACH') {
                color = this.COLOR_FOREACH;
            } else if (type === 'ENDFOREACH') {
                color = this.COLOR_ENDFOREACH;
            } else if (type === 'GIVE') {
                color = this.COLOR_GIVE;
            } else if (type === 'GOTO') {
                color = this.COLOR_GOTO;
            } else if (type === 'HEAR') {
                color = this.COLOR_HEAR;
            } else if (type === 'IF') {
                color = this.COLOR_IF;
            } else if (type === 'ENDIF') {
                color = this.COLOR_ENDIF;
            } else if (type === 'NEAR') {
                color = this.COLOR_NEAR;
            } else if (type === 'SAY') {
                color = this.COLOR_SAY;
            } else if (type === 'STEP') {
                color = this.COLOR_STEP;
            } else if (type === 'TAKE') {
                color = this.COLOR_TAKE;
            } else if (type === 'VARIABLE') {
                color = this.COLOR_VARIABLE;
            } else if (type === 'WRITE') {
                color = this.COLOR_WRITE;
            }

            console.log(`Block ${block.index} operator type: ${type}, color: ${color.toString(16)}`);

            // Draw background
            block.background.clear();
            block.background.beginFill(color);
            block.background.drawRect(0, 0, this.BLOCK_WIDTH, this.BLOCK_HEIGHT);
            block.background.endFill();
            block.background.lineStyle(2, 0x000000);

            // Position text
            block.text.x = this.BLOCK_WIDTH / 2;
            block.text.y = this.BLOCK_HEIGHT / 2;

            // Position graphics container
            block.graphics.x = block.x;
            if (!block.isDragging) {
                block.graphics.y = block.y;
            }

            currentY += this.BLOCK_HEIGHT + this.BLOCK_SPACING;
        }
    }

    destroy() {
        if (this.app) {
            this.app.destroy(true, { children: true, texture: true });
        }
        this.operationBlocks = [];
        this.draggedBlock = null;
        this.initialized = false;
    }
}

function PixiCodeEditor(props: { game: GameSerialized }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let isMounted = true;

        async function initRenderer() {
            if (canvasRef.current) {
                const renderer = PixiCodeEditorRenderer.getInstance();
                await renderer.init(canvasRef.current);
                if (isMounted) {
                    renderer.render(props.game);
                }
            }
        }

        initRenderer();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (props.game && canvasRef.current) {
            const renderFrame = async () => {
                const renderer = PixiCodeEditorRenderer.getInstance();
                if (canvasRef.current && (!renderer.app || renderer.app.canvas !== canvasRef.current)) {
                    await renderer.init(canvasRef.current);
                }
                renderer.render(props.game);
            };
            renderFrame();
        }
    }, [props.game]);

    return (
        <div style={{ border: '2px solid blue', display: 'inline-block', marginTop: 20 }}>
            <canvas ref={canvasRef} />
        </div>
    );
}

export default PixiCodeEditor;
