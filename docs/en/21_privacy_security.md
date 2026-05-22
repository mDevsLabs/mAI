# Privacy and Security 🔒

Data security and respect for your privacy are fundamental principles in the design of **mAI**.

## Encrypted Local Storage

All your sensitive data is stored locally on your device:
- **API Keys**: They are encrypted using industry-standard algorithms before being saved to your local storage. Your API keys are never sent to our servers; they are dispatched directly from your device to the respective LLM provider servers.
- **Chat History**: Your conversations remain on your machine (unless you explicitly enable secure cloud synchronization).

## Secure Connections

All outgoing requests to language model APIs use secure communication protocols (HTTPS / SSL), ensuring that the data exchanged cannot be intercepted over the network.

## Recommended Enterprise Practices

For the highest level of security in enterprise environments:
- Use models hosted locally via **Ollama** or a private inference server (meaning no data leaves the corporate network).
- Opt-out of anonymous telemetry in the general settings tab.
