# @mdevs/mai-cli

mAI command-line interface.

## Local Development

| Task | Command |
| --- | --- |
| Run in dev mode | `bun run dev -- <command>` |
| Build the CLI | `bun run build` |
| Link `mai` into your shell | `bun run cli:link` |
| Remove the global link | `bun run cli:unlink` |

- `bun run build` only generates `dist/index.js`.
- To make `mai` available in your shell, run `bun run cli:link`.
- After linking, if your shell still cannot find `mai`, run `rehash` in `zsh`.

## Custom Server URL

By default the CLI connects to `https://mai-officiel.vercel.app`. To point it at a different server (e.g. a local instance):

| Method | Command | Persistence |
| --- | --- | --- |
| Environment variable | `MAI_SERVER=http://localhost:4000 bun run dev -- <command>` | Current command only |
| Login flag | `mai login --server http://localhost:4000` | Saved to `~/.mai/settings.json` |

Priority: `MAI_SERVER` env var > `settings.json` > default official URL.

## Shell Completion

### Install completion for a linked CLI

| Shell | Command |
| --- | --- |
| `zsh` | `source <(mai completion zsh)` |
| `bash` | `source <(mai completion bash)` |

### Use completion during local development

| Shell | Command |
| --- | --- |
| `zsh` | `source <(bun src/index.ts completion zsh)` |
| `bash` | `source <(bun src/index.ts completion bash)` |

- Completion is context-aware. For example, `mai agent <Tab>` shows agent subcommands instead of top-level commands.
- If you update completion logic locally, re-run the corresponding `source <(...)` command to reload it in the current shell session.
- Completion only registers shell functions. It does not install the `mai` binary by itself.

## Quick Check

```bash
which mai
mai --help
mai agent <TAB>
```
