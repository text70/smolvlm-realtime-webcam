# Vidit — Agent Guide

## Stack

Single HTML file (`index.html`), no build tools, no package manager, no tests, no CI. Serves via file:// or any static server. Requires a running [llama.cpp](https://github.com/ggml-org/llama.cpp) server with a multimodal GGUF model.

## Key commands

```sh
# Start the model server (GPU)
llama-server -hf ggml-org/SmolVLM-500M-Instruct-GGUF -ngl 99

# Start the model server (CPU only)
llama-server -hf ggml-org/SmolVLM-500M-Instruct-GGUF
```

Default server port is `8080`. Alternative models: see [llama.cpp multimodal docs](https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal.md).

## How the app works

- Captures webcam frames at a configurable interval (default 500ms)
- Sends each frame as a base64 JPEG + text instruction to `{baseURL}/v1/chat/completions` (OpenAI-compatible chat completions endpoint)
- Displays the model response
- Camera requires HTTPS or localhost

## Architecture notes

- Single entrypoint: `index.html` — all HTML, CSS, and JS in one file
- No server-side component; the page talks directly to `llama-server`
- Base URL is configurable via the UI (default `http://localhost:8080`)
- Frame capture uses `<canvas>` to snapshot `<video>` → JPEG quality 0.8
- Requests are throttled: `frameBusy` flag + `setTimeout` chaining prevents overlapping requests; a Web Worker provides non-throttled timer ticks when background mode is enabled
- Page must be opened in a browser that supports `navigator.mediaDevices.getUserMedia`

## Features an agent should know about

- **localStorage persistence**: base URL, instruction, interval, motion sensitivity, JSON mode, stream mode, keywords, preset, background mode, and dark mode are all saved/restored across page reloads
- **Motion-gated capture**: sensitivity slider (0 = disabled, 1-100 = increasing sensitivity); compares downsampled pixel data between frames to skip sending when nothing changes
- **Response log**: timestamped, scrollable log of all responses with alert/error highlighting; capped at 1000 entries; exportable as JSON
- **Alert system**: comma-separated keywords trigger title flash, audio beep (Web Audio API square wave), and browser notification; flagged entries highlighted in log
- **SSE streaming**: toggleable; when enabled, uses `stream: true` on the API call and renders tokens incrementally via `ReadableStream`
- **Background worker**: when enabled, uses a `Blob`-based Web Worker for timer ticks, avoiding browser `setInterval` throttling in background tabs
- **Connection health**: periodic `GET /v1/models` every 15s; status dot (green/yellow/red) in the status bar
- **Retry logic**: up to 3 retries with 1s/2s/4s backoff on server errors
- **Camera selection**: dropdown populated from `enumerateDevices()`
- **Built-in presets**: "Describe scene", "JSON objects", "Surveillance"; custom presets saved to localStorage
- **Keyboard shortcuts**: Space = start/stop, `I` = focus instruction, `Ctrl+E` / `Cmd+E` = export log, `D` = toggle dark mode
- **Dark mode**: CSS custom properties, toggled via button or `D` key; respects `prefers-color-scheme` on initial load
- **Responsive layout**: flexbox with breakpoint at 560px for mobile

## Important gotchas

- Connection health check hits `{baseURL}/v1/models` — works with llama.cpp but may fail with proxies that don't expose that endpoint
- Streaming (`stream: true`) uses the ReadableStream API; the response is parsed as NDJSON SSE lines (`data: {...}`)
- The background Worker is recreated on each start; it can't be reused after `stop()` since it calls `close()`
- Log entries store `_el` references to DOM elements; clearing the log wipes them, but new entries will create fresh elements

## Style conventions

- Plain ES module–free JavaScript (inline `<script>`, no imports)
- No linting, formatting, or type checking configuration exists
- All UI text in English
