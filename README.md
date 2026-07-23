# Vidit

![demo](./demo.png)

Real-time camera surveillance and scene analysis powered by a local multimodal vision model (llama.cpp).

All processing stays on your machine — no cloud, no telemetry, no external servers.

## Quick start

```sh
# 1. Start the vision model
llama-server -hf ggml-org/SmolVLM-500M-Instruct-GGUF -ngl 99

# 2. Start the HTTPS server
node server.js

# 3. Open the printed URL in your browser and click Start
```

## Requirements

- [llama.cpp](https://github.com/ggml-org/llama.cpp) with a multimodal GGUF model
- [Node.js](https://nodejs.org) 18+
- A browser that supports `navigator.mediaDevices.getUserMedia` (Chrome, Firefox, Edge, Safari)

## How to run

### 1. Start the vision model

```sh
llama-server -hf ggml-org/SmolVLM-500M-Instruct-GGUF -ngl 99
```

Default port is `http://localhost:8080`. Add `-ngl 99` for GPU acceleration. See [supported models](https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal.md).

### 2. Start the page server

```sh
node server.js
```

On first run it generates an ECDSA P-384 self-signed certificate, then prints the URL:

```
[vidit] Server running at https://<your-lan-ip>:8443
```

Open that URL in your browser. Your browser will warn about the self-signed cert — this is safe. The connection is encrypted with TLS 1.3.

> **To remove the warning:** Use [`mkcert`](https://github.com/FiloSottile/mkcert): `mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 <your-lan-ip>` then restart.

#### LAN mode vs Open Internet mode

| Command | Binds to | Use case |
|---|---|---|
| `node server.js` | Auto-detected LAN IP | Default — reachable on your local subnet only |
| `BIND=all node server.js` | `0.0.0.0` (all interfaces) | Docker, VPNs, bridge networks (MAKE SURE YOU HAVE A FIREWALL like ufw or similar enabled if you are going to rawdog the internet! |

### 3. How to use the app

Click **Start** and grant camera permission. The page sends each webcam frame to the vision model and displays the response.

## Interface

| Setting | Default | What it does |
|---|---|---|
| **Base API** | `http://localhost:8080` | The llama.cpp server URL |
| **Camera** | First device | Which webcam to use |
| **Interval** | 500ms | Delay between frame captures |
| **Motion sensitivity** | Medium | Skips API calls when nothing changes in frame |
| **Stream mode** | On | Shows model responses token-by-token |
| **JSON mode** | Off | Formats response as JSON |
| **Keywords** | (empty) | Alert triggers — matched text flashes the title, plays a beep, and sends a notification |
| **Preset** | Custom | Built-in presets: *Describe scene*, *JSON objects*, *Surveillance* |
| **Instruction** | — | Text prompt sent with each frame |
| **Background mode** | Off | Uses a Web Worker to keep timer accurate when tab is backgrounded |

### Keyboard shortcuts

| Key | Action |
|---|---|
| **Space** | Start / Stop |
| **I** | Focus instruction field |
| **Ctrl+E / Cmd+E** | Export response log as JSON |
| **D** | Toggle dark mode |

## Security

- **TLS 1.3 only** — the built-in server rejects anything below TLS 1.3
- **ECDSA P-384 certificate** — auto-generated on first run
- **Content Security Policy** — restricts resource origins, blocks inline event handlers and `javascript:` URLs
- **Security headers** — HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`
- **Zero dependencies** — `server.js` uses only Node.js built-in modules; no npm packages
- **Local by design** — all frames stay on your machine; the only network call is to the configured API endpoint

## Contributing

This is a single-file HTML app with no build system. All changes go in `index.html`. The HTTPS server is `server.js`.

```sh
# Edit the app
index.html

# Edit the server
server.js

# Preview locally
node server.js
```

Before submitting a PR:

- Test that the app loads and runs from `file://` and over HTTPS
- Make sure keyboard shortcuts and localStorage persistence still work
- Keep `index.html` self-contained — no external files, no CDN scripts
- Keep `server.js` dependency-free — Node.js built-in modules only

## License

MIT
