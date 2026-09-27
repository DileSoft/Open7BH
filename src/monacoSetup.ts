/**
 * Bundled Monaco setup: wires the Vite-managed workers and injects the
 * open7bh ambient level types so the win-condition code editor offers
 * completion and hover information.
 */
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { loader } from '@monaco-editor/react';
import { LEVEL_TYPES_DTS } from './winCodeTypes';

// The lightweight `editor.api` entry marks `languages.typescript` as a
// deprecated stub; the real namespace is provided by the contribution above.
interface TsDefaults {
    setCompilerOptions(options: Record<string, unknown>): void;
    setDiagnosticsOptions(options: Record<string, unknown>): void;
    addExtraLib(content: string, filePath?: string): { dispose(): void };
}

interface TsNamespace {
    ScriptTarget: { ES2020: number };
    typescriptDefaults: TsDefaults;
    javascriptDefaults: TsDefaults;
}

const ts = (monaco.languages as unknown as { typescript: TsNamespace }).typescript;

// Vite bundles these workers; Monaco asks for one per language.
(self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
    getWorker(_moduleId: string, label: string) {
        if (label === 'typescript' || label === 'javascript') {
            return new TsWorker();
        }
        return new EditorWorker();
    },
};

// Use the locally bundled monaco instead of the CDN default.
loader.config({ monaco });

const compilerOptions = {
    target: ts.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    allowJs: true,
    checkJs: true,
    noImplicitAny: false,
    strict: false,
    noEmit: true,
};

const diagnosticsOptions = {
    noSemanticValidation: false,
    noSyntaxValidation: false,
};

[ts.typescriptDefaults, ts.javascriptDefaults].forEach(defaults => {
    defaults.setCompilerOptions(compilerOptions);
    defaults.setDiagnosticsOptions(diagnosticsOptions);
    defaults.addExtraLib(LEVEL_TYPES_DTS, 'inmemory://open7bh/level.d.ts');
});

export default monaco;
