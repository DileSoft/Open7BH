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
                // After init, if we have a game, we might need to "kick off" first registration
                // though logic objects should have registered themselves during deserialization.
                // However, PixiRenderer might have been cleared if reused.
                if (isMounted && props.game.object?.level) {
                   const level = props.game.object.level;
                   renderer.resize(level.width, level.height);
                   Object.values(level.cells).forEach(cell => {
                       renderer.registerCell(cell);
                       const char = cell.getCharacter();
                       if (char) renderer.registerCharacter(char);
                   });
                }
            }
        }
        
        initRenderer();

        return () => {
            isMounted = false;
        };
    }, []);

    // Update renderer parameters when game state changes (like speed)
    useEffect(() => {
        if (props.game) {
            PixiRenderer.getInstance().update(props.game);
        }
    }, [props.game]);

    return (
        <div style={{ border: '2px solid red', display: 'inline-block', marginTop: 20 }}>
            <canvas ref={canvasRef} />
        </div>
    );
}

export default PixiCells;
