# Vidit

![demo](./demo.png)

Real-time camera surveillance and scene analysis using llama.cpp server with a multimodal vision model

## How to setup

1. Install [llama.cpp](https://github.com/ggml-org/llama.cpp)
2. Run `llama-server -hf ggml-org/SmolVLM-500M-Instruct-GGUF`  
   Note: you may need to add `-ngl 99` to enable GPU (if you are using NVidia/AMD/Intel GPU)  
   Note (2): You can also try other models [here](https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal.md)
3. Open `index.html`
4. Click "Start" and enjoy

## User parameters

| Parameter | Default | Description |
|---|---|---|
| **Base API** | `http://localhost:8080` | llama.cpp server URL |
| **Camera** | first device | Webcam selection from `enumerateDevices()` |
| **Background mode** | off | Uses a Web Worker to avoid timer throttling when the tab is backgrounded |
| **Interval** | 500ms | Delay between frame captures (100ms–5s) |
| **Motion sensitivity** | Medium (2) | Motion-gated capture. Levels: Disabled, Low, Medium, High, Very High. Skips API calls when nothing changes. |
| **JSON mode** | off | Checkbox hint — pair with a JSON instruction preset |
| **Stream mode** | on | Uses SSE (`stream: true`) to render tokens incrementally via `ReadableStream` |
| **Keywords** | (empty) | Comma-separated alert triggers. Matched responses highlight the log entry, flash the title, play a beep, and fire a browser notification. |
| **Preset** | Custom | Built-in: *Describe scene*, *JSON objects*, *Surveillance*. Custom presets saved to localStorage. |
| **Instruction** | (user-set) | Text prompt sent with each frame |

### Keyboard shortcuts

| Key | Action |
|---|---|
| **Space** | Start / Stop |
| **I** | Focus instruction field |
| **Ctrl+E / Cmd+E** | Export response log as JSON |
| **D** | Toggle dark mode |
