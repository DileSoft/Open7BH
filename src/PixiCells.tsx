import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GameSerialized } from './Classes/Game';
import { PixiRenderer } from './PixiRenderer';

function PixiCells(props: { game: GameSerialized }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { i18n } = useTranslation();

    useEffect(() => {
        async function initRenderer() {
            if (canvasRef.current) {
                const renderer = PixiRenderer.getInstance();
                try {
                    await renderer.init(canvasRef.current);
                } catch (e) {
                    console.error('PixiRenderer.init() failed:', e);
                    return;
                }
                
                // Register the level into the (single) renderer.
                // Not gated on isMounted: the renderer is a singleton and registration
                // is idempotent (registerCell dedupes by cell identity), so even if
                // StrictMode runs this effect twice, cells are registered exactly once.
                if (props.game.object?.level) {
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
    }, []);

    // Update renderer parameters when game state changes (like speed)
    useEffect(() => {
        if (props.game) {
            PixiRenderer.getInstance().update(props.game);
        }
    }, [props.game, i18n.language]);

    return (
        <div style={{ border: '2px solid red', display: 'inline-block', marginTop: 20 }}>
            <canvas ref={canvasRef} />
        </div>
    );
}

export default PixiCells;
