# Agent Customization ⚙️

Fine-tuning agents in **mAI** allows you to deeply modify their behavior, response style, and the tools they can access.

## Basic Settings

For each agent, you can configure:
- **System Prompt**: The foundational instructions defining the personality, rules, and role of the agent. This is the most influential setting on the agent's responses.
- **Language Model**: Select the default LLM to use (e.g., GPT-4o, Claude 3.5 Sonnet, Llama 3).

## Advanced Settings

You can also modify generation hyperparameters:
- **Temperature**: Controls the creativity of the responses. A lower temperature (e.g., 0.2) produces more factual and deterministic answers. A higher temperature (e.g., 0.9) encourages creativity.
- **Top P**: Another method to control response diversity.
- **Presence / Frequency Penalty**: Encourages or discourages the agent from repeating the same words or deviating from the topics discussed.
- **Max Tokens**: Limits the maximum length of the generated response.
