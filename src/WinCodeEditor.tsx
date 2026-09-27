import Editor from '@monaco-editor/react';
import { useTranslation } from 'react-i18next';
// Importing the setup registers the local Monaco instance and the level types.
import './monacoSetup';

/**
 * Monaco-based editor for the win-condition "custom code" expression.
 * The ambient `Level` type is injected, so `/** @param {Level} level *\/` gives
 * full completion while staying valid JavaScript for `new Function`.
 */
function WinCodeEditor(props: { value: string; onChange: (value: string) => void }) {
    const { t } = useTranslation();
    return <div style={{ flexBasis: '100%', width: '100%' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{t('editor.customCode')}</div>
        <div style={{ border: '1px solid #ccc', borderRadius: 4 }}>
            <Editor
                height="220px"
                language="javascript"
                value={props.value}
                onChange={value => props.onChange(value ?? '')}
                options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 13,
                    tabSize: 2,
                    automaticLayout: true,
                    lineNumbersMinChars: 3,
                    // Render suggestion/hover widgets in a fixed overlay so they
                    // are not clipped by the editor's own bounds.
                    fixedOverflowWidgets: true,
                }}
            />
        </div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{t('editor.conditionCodeHint')}</div>
    </div>;
}

export default WinCodeEditor;
