# AI Assignment Helper — QVAC

AI Assignment Helper is a local-first college assignment assistant powered by **Tether's QVAC SDK**.

The user enters an assignment question and subject. QVAC runs a local language model on the same machine and generates a structured educational solution.

## QVAC functions used

This project explicitly calls:

- `loadModel()`
- `completion()`
- `unloadModel()`

## SDK version

```text
@qvac/sdk 0.19.1
```

## Features

- Assignment question input
- Subject selector
- Step-by-step solutions
- Examples/code when relevant
- Local AI inference
- No hosted AI API key
- Responsive UI
- MIT open-source license

## Requirements

- Node.js 22.17+ recommended (current QVAC JS/TS SDK requirement)
- On Windows, a Vulkan 1.4-capable GPU driver/runtime is required by QVAC, even when CPU inference is selected
- npm
- Enough local RAM/storage for the QVAC model
- Internet access for the first model download

## Installation

```bash
npm install
```

## Start

```bash
npm start
```

Open:

```text
http://localhost:3000
```

The first request may take longer because QVAC downloads and loads the model. Subsequent requests can reuse the local model cache.

## Architecture

```text
Browser
   |
   v
Local Express server
   |
   v
Tether QVAC SDK
   |
   v
Local language model
   |
   v
Generated assignment solution
```

No cloud AI inference service is used by this project.

## License

MIT License. See `LICENSE`.

## Credits

Built using Tether's QVAC SDK:

https://github.com/tetherto/qvac


## Troubleshooting: RPC initialization timeout

If the browser shows:

```text
RPC initialization timed out after 30000ms
```

first run:

```powershell
npx --package "@qvac/cli@latest" qvac doctor
node -v
npm -v
```

Make sure Node.js is at least 22.17 and that `qvac doctor` passes the required host checks.

This project includes `qvac.config.json` with a 120-second worker startup timeout and enables QVAC logs. The app also forces the LLM to CPU mode to avoid unsupported GPU execution.

If the worker still exits, copy the complete PowerShell output from `npm start` and the `qvac doctor` report when asking for help. The SDK attaches the worker exit code and stderr tail to startup failures.

## Bounty Submission

This project demonstrates local AI inference using Tether QVAC SDK 0.19.1 with loadModel() and completion().
