# Plan: Switch Settings to Minimax Provider

## Goal
Update the AI Settings modal so it defaults to the Minimax API endpoint, lets users pick from three Minimax models via a dropdown, and shows the Minimax logo.

## Files to modify

### Chunk 1 — Defaults + Settings UI

**1. `src/lib/storage.ts`**
- Change `getSettings()` defaults:
  - `openaiBaseUrl`: `'https://api.minimax.io/v1/text/chatcompletion_v2'`
  - `openaiModel`: `'Minimax-M3'`

**2. `src/components/SettingsModal.tsx`**
- Import minimax logo: `import minimaxLogo from '/assets/minimax.png';`
- Header: replace the CPU icon + title with the Minimax logo image and update title text to something like "Minimax Model Configuration".
- Base URL section:
  - Update fallback default in `handleTestConnection` from `'https://api.openai.com/v1'` to `'https://api.minimax.io/v1/text/chatcompletion_v2'`.
  - Update the `<input>` placeholder to the Minimax URL.
  - Optionally update label text to "Minimax Base URL" or keep generic.
- Model section:
  - Replace the text `<input>` for `openaiModel` with a `<select>` dropdown:
    - `"Minimax-M3"`
    - `"Minimax-M2.7"`
    - `"MiniMax-M2.7-highspeed"`
  - Update the hint text below the model field to list the three options.
- Info banner text: optionally update to mention Minimax instead of generic OpenRouter/DeepSeek list.
- Ensure `handleTestConnection`'s `model` fallback uses the new default model string.

## Acceptance criteria
1. `getSettings()` returns the Minimax base URL and `Minimax-M3` as defaults.
2. Settings modal shows the Minimax logo at the top.
3. The base URL input defaults to / shows the Minimax endpoint.
4. The model field is a dropdown with the 3 exact options listed above.
5. The test-connection logic uses the Minimax endpoint when the field is empty.
6. The component compiles and runs without TypeScript/runtime errors.
