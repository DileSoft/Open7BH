import { useEffect, useRef } from 'react';
import { GameSerialized } from './Classes/Game';
import { PixiRenderer } from './PixiRenderer';

function PixiCells(props: { game: GameSerialized }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let isMounted = true;
        
        async function initRenderer() {
            if (canvasRef.current) {
                const renderer = PixiRenderer.getInstance();
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
        if (props.game) {
            try {
                PixiRenderer.getInstance().render(props.game);
            } catch (e) {
                console.error('Pixi render error:', e);
            }
        }
    }, [props.game]); // Restore simple dependency for verification

    return (
        <div style={{ border: '2px solid red', display: 'inline-block', marginTop: 20 }}>
            <canvas ref={canvasRef} />
        </div>
    );
}

export default PixiCells;
