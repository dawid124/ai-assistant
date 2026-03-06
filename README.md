# IA Assistant

A voice-activated smart home AI assistant that processes natural language queries via MQTT and executes actions using a modular tool system.

## Overview

The assistant listens for user queries (text or audio) over MQTT, analyzes intent using an LLM, creates a session plan, and executes the appropriate tools in sequence. Results are published back over MQTT for TTS or dialogue management.

## Architecture

```
MQTT Broker
    |
    +-- Intent Controller   --> Intent Service --> Session Plan (LLM)
    |                                                    |
    +-- Audio Frame Controller (saves .wav files)        v
                                                    Tools Service
                                                         |
                                    +--------------------+--------------------+
                                    |          |          |         |         |
                               SmartHome  AiQuestion  WebSearch  Telegram  ShowOnTv
```

## Tools

| Tool | Description |
|------|-------------|
| `SmartHome` | Controls smart home devices via HTTP |
| `AiQuestion` | Answers general questions using an LLM |
| `WebSearch` | Searches the web and summarizes results |
| `SendTelegram` | Sends messages via Telegram bot |
| `ShowOnTv` | Displays content on TV |
| `NotRecognized` | Fallback for unrecognized intents |

## Features

- **MQTT integration** — communicates with NLU engines and dialogue managers (e.g. Rhasspy, Home Assistant)
- **Session planning** — LLM creates a multi-step task plan per query
- **Caching** — exact query cache and vector-based action type cache to reduce LLM calls
- **Audio frame handling** — receives and saves binary audio frames as `.wav` files
- **Memory** — stores completed task history for context
- **Web interface** — HTTP endpoint for testing intents directly

## Tech Stack

- **Runtime:** Node.js / Bun with TypeScript
- **LLM:** OpenAI API (`gpt-*` models, configurable)
- **Vector DB:** Qdrant (for semantic caching)
- **Transport:** MQTT
- **Web:** Express.js
- **Web scraping:** Firecrawl, Cheerio

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (create `.env` or set via config):
   - `OPENAI_API_KEY`
   - `QDRANT_URL`, `QDRANT_API_KEY`
   - `MQTT_BROKER_URL`
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
   - `FIRECRAWL_API_KEY`

3. Run the application:
   ```bash
   npx tsx src/app.ts
   ```

## API

### POST `/intent`

Test an intent directly without MQTT.

```json
{
  "input": "What is the weather today?",
  "siteId": "default"
}
```

## MQTT Topics

Configured via properties:

| Direction | Topic | Description |
|-----------|-------|-------------|
| Subscribe | `nluQuery` | Incoming user queries |
| Subscribe | `audioFrame` | Incoming binary audio frames |
| Publish | `ttsSay` | Text to be spoken |
| Publish | `dialogueEndSession` | End dialogue session |
| Publish | `dialogueContinueSession` | Continue dialogue session |
