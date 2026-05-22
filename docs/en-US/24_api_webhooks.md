# API and Webhooks 🔗

**mAI** provides programmatical interfaces to allow external integrations with your own applications, web services, or automation scripts.

## Local API (HTTP)

The mAI desktop app can run a secure local web server on a designated port. This server exposes several endpoints:
- `POST /api/chat`: Sends a message to a specific agent and returns a structured response (supports standard or streaming format).
- `GET /api/agents`: Lists all available agents and their configurations.
- `POST /api/agents`: Allows creating a new agent programmatically.

## Webhooks Integration

You can configure outgoing webhooks in mAI's advanced settings. A webhook automatically posts a JSON payload to an external URL whenever specific events occur:
- **Chat message completed**: Triggered as soon as an agent finishes generating a response.
- **Agent created**: Triggered when a new agent profile is added.
- **System error**: Triggered during API key validation issues or LLM provider outages.
