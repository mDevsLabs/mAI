<div align="center"><a name="readme-top"></a>

[![mAI](./public/avatars/may.PNG)][vercel-link]

# mAI

mAI organise vos agents pour opérer 24h/24 et 7j/7.

Il recrute, planifie et gère les rapports de toute votre équipe d'IA.

Vous gardez le contrôle — sans avoir besoin de rester en ligne.

**Français** · [English](./README.en-US.md) · [Español](./README.es-ES.md) · [Deutsch](./README.de-DE.md) · [Site Officiel][official-site] · [Changelog][changelog] · [Documents][docs] · [Blog][blog] · [Feedback][github-issues-link]

<!-- SHIELD GROUP -->

[![][github-release-shield]][github-release-link]
[![][vercel-shield]][vercel-link]
[![][discord-shield]][discord-link]<br/>
[![][github-action-test-shield]][github-action-test-link]
[![][github-action-release-shield]][github-action-release-link]
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]<br>

**Partager le Dépôt mAI**

[![][share-x-shield]][share-x-link]
[![][share-telegram-shield]][share-telegram-link]
[![][share-whatsapp-shield]][share-whatsapp-link]
[![][share-reddit-shield]][share-reddit-link]
[![][share-weibo-shield]][share-weibo-link]
[![][share-mastodon-shield]][share-mastodon-link]
[![][share-linkedin-shield]][share-linkedin-link]

</sup>

</div>

<details>
<summary><kbd>Table des matières</kbd></summary>

#### TOC

- [👋🏻 Démarrage & Rejoindre notre Communauté](#-démarrage--rejoindre-notre-communauté)
- [✨ Fonctionnalités](#-fonctionnalités)
  - [Opérateur : Les Agents comme Unité de Travail](#opérateur--les-agents-comme-unité-de-travail)
  - [Créer : Des Agents sur mesure](#créer--des-agents-sur-mesure)
  - [Collaborer : De nouvelles formes de réseaux](#collaborer--de-nouvelles-formes-de-réseaux)
  - [Évoluer : Co-évolution Humains/Agents](#évoluer--co-évolution-humainsagents)
- [🛳 Hébergement Propre](#-hébergement-propre)
  - [`A` Déployer avec Vercel, Zeabur, Sealos ou Alibaba Cloud](#a-déployer-avec-vercel-zeabur-sealos-ou-alibaba-cloud)
  - [`B` Déployer avec Docker](#b-déployer-avec-docker)
  - [Variables d'Environnement](#variables-denvironnement)
- [📦 Écosystème](#-écosystème)
- [🧩 Plugins](#-plugins)
- [⌨️ Développement Local](#️-développement-local)
- [🤝 Contribuer](#-contribuer)
- [❤️ Sponsors](#️-sponsors)
- [🔗 Autres Produits](#-autres-produits)

####

<br/>

</details>

<br/>

## 👋🏻 Démarrage & Rejoindre notre Communauté

Nous sommes un groupe d'ingénieurs-designers passionnés, espérant fournir des composants et outils au design moderne pour l'IA générative.
En adoptant une approche ouverte, nous visons à offrir aux développeurs et utilisateurs un écosystème produit transparent et convivial.

Que ce soit pour les utilisateurs ou les développeurs professionnels, mAI sera votre terrain de jeu d'Agents IA. Veuillez noter que mAI est actuellement en développement actif, et vos retours sont les bienvenus pour tout [problème][issues-link] rencontré.


| [![][discord-shield-badge]][discord-link] | Join our Discord community! This is where you can connect with developers and other enthusiastic users of mAI. |
| :--- | :--- |

> [!IMPORTANT]
>
> **Star Us**, You will receive all release notifications from GitHub without any delay ~ ⭐️


## ✨ Features

Today’s agents are one-off, task-driven tools. They lack context, live in isolation, and require manual hand-offs between different windows and models. While some maintain memory, it is often global, shallow, and impersonal. In this mode, users are forced to toggle between fragmented conversations, making it difficult to form structured productivity.

**mAI changes everything.**

Avec mAI, passez à la vitesse supérieure. In mAI, we treat **Agents as the unit of work**, providing an infrastructure where humans and agents co-evolve.

### Operator: Agents as the Unit of Work

Hires, schedules, and reports on your entire AI team.

- **More productivity. Fewer tools**: Bring all your agents under one roof.
- **IM Gateway**: Agents where you already chat.

[![][back-to-top]](#readme-top)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### Create: Agents as the Unit of Work

Building a personalized AI team starts with the **Agent Builder**. You can describe what you need once, and the agent setup starts right away, applying auto-configurations so you can use it instantly.

- **Unified Intelligence**: Seamlessly access any model and any modality—all under your control.
- **10,000+ Skills**: Connect your agents to the skills you use every day with a library of over 10,000 tools and MCP-compatible plugins.

[![][back-to-top]](#readme-top)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### Collaborate: Scale New Forms of Collaboration Networks

mAI introduces **Agent Groups**, allowing you to work with agents like real teammates. The system assembles the right agents for the task, enabling parallel collaboration and iterative improvement.

- **Pages**: Write and refine content with multiple agents in one place with a shared context.
- **Schedule**: Schedule runs and let agents do the work at the right time, even while you are away.
- **Project**: Organize work by project to keep everything structured and easy to track.
- **Workspace**: A shared space for teams to collaborate with agents, ensuring clear ownership and visibility across the organization.

[![][back-to-top]](#readme-top)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### Evolve: Co-evolution of Humans and Agents

The best AI is one that understands you deeply. mAI features **Personal Memory** that builds a clear understanding of your needs.

- **Continual Learning**: Your agents learn from how you work, adapting their behavior to act at the right moment.
- **White-Box Memory**: We believe in transparency. Your agents use structured, editable memory, giving you full control over what they remember.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

> ✨ more features will be added when mAI evolve.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛳 Self Hosting

mAI provides Self-Hosted Version with Vercel, Alibaba Cloud, and [Docker Image][docker-release-link]. This allows you to deploy your own chatbot within a few minutes without any prior knowledge.

> \[!TIP]
>
> Learn more about [📘 Build your own mAI][docs-self-hosting] by checking it out.

### `A` Deploying with Vercel, Zeabur , Sealos or Alibaba Cloud

"If you want to deploy this service yourself on Vercel, Zeabur or Alibaba Cloud, you can follow these steps:

- Prepare your [OpenAI API Key](https://platform.openai.com/account/api-keys).
- Click the button below to start deployment: Log in directly with your GitHub account, and remember to fill in the `OPENAI_API_KEY`(required) on the environment variable section.
- After deployment, you can start using it.
- Bind a custom domain (optional): The DNS of the domain assigned by Vercel is polluted in some areas; binding a custom domain can connect directly.

<div align="center">

|           Deploy with Vercel            |                     Deploy with Zeabur                      |                     Deploy with Sealos                      |                       Deploy with RepoCloud                       |                         Deploy with Alibaba Cloud                         |
| :-------------------------------------: | :---------------------------------------------------------: | :---------------------------------------------------------: | :---------------------------------------------------------------: | :-----------------------------------------------------------------------: |
| [![][deploy-button-image]][deploy-link] | [![][deploy-on-zeabur-button-image]][deploy-on-zeabur-link] | [![][deploy-on-sealos-button-image]][deploy-on-sealos-link] | [![][deploy-on-repocloud-button-image]][deploy-on-repocloud-link] | [![][deploy-on-alibaba-cloud-button-image]][deploy-on-alibaba-cloud-link] |

</div>

#### After Fork

After fork, only retain the upstream sync action and disable other actions in your repository on GitHub.

#### Keep Updated

If you have deployed your own project following the one-click deployment steps in the README, you might encounter constant prompts indicating "updates available." This is because Vercel defaults to creating a new project instead of forking this one, resulting in an inability to detect updates accurately.

> \[!TIP]
>
> We suggest you redeploy using the following steps, [📘 Auto Sync With Latest][docs-upstream-sync]

<br/>

### `B` Deploying with Docker

[![][docker-release-shield]][docker-release-link]
[![][docker-size-shield]][docker-size-link]
[![][docker-pulls-shield]][docker-pulls-link]

We provide a Docker image for deploying the mAI service on your own private device. Use the following command to start the mAI service:

1. create a folder to for storage files

```fish
$ mkdir mAI-db && cd mAI-db
```

2. init the mAI infrastructure

```fish
bash <(curl -fsSL https://lobe.li/setup.sh)
```

3. Start the mAI service

```fish
docker compose up -d
```

> \[!NOTE]
>
> For detailed instructions on deploying with Docker, please refer to the [📘 Docker Deployment Guide][docs-docker]

<br/>

### Environment Variable

This project provides some additional configuration items set with environment variables:

| Environment Variable | Required | Description                                                                                                                                                               | Example                                                                                                              |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`     | Yes      | This is the API key you apply on the OpenAI account page                                                                                                                  | `sk-xxxxxx...xxxxxx`                                                                                                 |
| `OPENAI_PROXY_URL`   | No       | If you manually configure the OpenAI interface proxy, you can use this configuration item to override the default OpenAI API request base URL                             | `https://api.chatanywhere.cn` or `https://aihubmix.com/v1` <br/>The default value is<br/>`https://api.openai.com/v1` |
| `OPENAI_MODEL_LIST`  | No       | Used to control the model list. Use `+` to add a model, `-` to hide a model, and `model_name=display_name` to customize the display name of a model, separated by commas. | `qwen-7b-chat,+glm-6b,-gpt-3.5-turbo`                                                                                |

> \[!NOTE]
>
> The complete list of environment variables can be found in the [📘 Environment Variables][docs-env-var]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 Ecosystem

| NPM                               | Repository                              | Description                                                                                           | Version                                   |
| --------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [@lobehub/ui][lobe-ui-link]       | [lobehub/lobe-ui][lobe-ui-github]       | Open-source UI component library dedicated to building AIGC web applications.                         | [![][lobe-ui-shield]][lobe-ui-link]       |
| [@lobehub/icons][lobe-icons-link] | [lobehub/lobe-icons][lobe-icons-github] | Popular AI / LLM Model Brand SVG Logo and Icon Collection.                                            | [![][lobe-icons-shield]][lobe-icons-link] |
| [@lobehub/tts][lobe-tts-link]     | [lobehub/lobe-tts][lobe-tts-github]     | High-quality & reliable TTS/STT React Hooks library                                                   | [![][lobe-tts-shield]][lobe-tts-link]     |
| [@lobehub/lint][lobe-lint-link]   | [lobehub/lobe-lint][lobe-lint-github]   | Configurations for ESlint, Stylelint, Commitlint, Prettier, Remark, and Semantic Release for mAI. | [![][lobe-lint-shield]][lobe-lint-link]   |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🧩 Plugins

Plugins provide a means to extend the [Function Calling][docs-function-call] capabilities of mAI. They can be used to introduce new function calls and even new ways to render message results. If you are interested in plugin development, please refer to our [📘 Plugin Development Guide][docs-plugin-dev] in the Wiki.

- [lobe-chat-plugins][lobe-chat-plugins]: This is the plugin index for mAI. It accesses index.json from this repository to display a list of available plugins for mAI to the user.
- [chat-plugin-template][chat-plugin-template]: This is the plugin template for mAI plugin development.
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]: The mAI Plugin SDK assists you in creating exceptional chat plugins for mAI.
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]: The mAI Plugins Gateway is a backend service that provides a gateway for mAI plugins. We deploy this service using Vercel. The primary API POST /api/v1/runner is deployed as an Edge Function.

> \[!NOTE]
>
> The plugin system is currently undergoing major development. You can learn more in the following issues:
>
> - [x] [**Plugin Phase 1**](https://github.com/mDevsLabs/mAI/issues/73): Implement separation of the plugin from the main body, split the plugin into an independent repository for maintenance, and realize dynamic loading of the plugin.
> - [x] [**Plugin Phase 2**](https://github.com/mDevsLabs/mAI/issues/97): The security and stability of the plugin's use, more accurately presenting abnormal states, the maintainability of the plugin architecture, and developer-friendly.
> - [x] [**Plugin Phase 3**](https://github.com/mDevsLabs/mAI/issues/149): Higher-level and more comprehensive customization capabilities, support for plugin authentication, and examples.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ Local Development

You can use GitHub Codespaces for online development:

[![][codespaces-shield]][codespaces-link]

Or clone it for local development:

```fish
$ git clone https://github.com/mDevsLabs/mAI.git
$ cd mAI
$ pnpm install
$ pnpm dev          # Full-stack (Next.js + Vite SPA)
$ bun run dev:spa   # SPA frontend only (port 9876)
```

> **Debug Proxy**: After running `dev:spa`, the terminal prints a proxy URL like
> `https://app.mAI.com/_dangerous_local_dev_proxy?debug-host=http%3A%2F%2Flocalhost%3A9876`.
> Open it to develop locally against the production backend with HMR.

If you would like to learn more details, please feel free to look at our [📘 Development Guide][docs-dev-guide].

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 Contributing

Contributions of all types are more than welcome; if you are interested in contributing code, feel free to check out our GitHub [Issues][github-issues-link] and [Projects][github-project-link] to get stuck in to show us what you're made of.

> \[!TIP]
>
> We are creating a technology-driven forum, fostering knowledge interaction and the exchange of ideas that may culminate in mutual inspiration and collaborative innovation.
>
> Help us make mAI better. Welcome to provide product design feedback, user experience discussions directly to us.
>
> **Principal Maintainer:** [@mDevsLabs](https://github.com/mDevsLabs)
[![][pr-welcome-shield]][pr-welcome-link]
[![][submit-agents-shield]][submit-agents-link]
[![][submit-plugin-shield]][submit-plugin-link]


<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ❤️ Sponsor

Every bit counts and your one-time donation sparkles in our galaxy of support! You're a shooting star, making a swift and bright impact on our journey. Thank you for believing in us – your generosity guides us toward our mission, one brilliant flash at a time.


<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 More Products

- **[🅰️ Lobe SD Theme][lobe-theme]:** Modern theme for Stable Diffusion WebUI, exquisite interface design, highly customizable UI, and efficiency-boosting features.
- **[⛵️ Lobe Midjourney WebUI][lobe-midjourney-webui]:** WebUI for Midjourney, leverages AI to quickly generate a wide array of rich and diverse images from text prompts, sparking creativity and enhancing conversations.
- **[🌏 Lobe i18n][lobe-i18n] :** Lobe i18n is an automation tool for the i18n (internationalization) translation process, powered by ChatGPT. It supports features such as automatic splitting of large files, incremental updates, and customization options for the OpenAI model, API proxy, and temperature.
- **[💌 Lobe Commit][lobe-commit]:** Lobe Commit is a CLI tool that leverages Langchain/ChatGPT to generate Gitmoji-based commit messages.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

<details><summary><h4>📝 License</h4></summary>

[![][fossa-license-shield]][fossa-license-link]

</details>

Copyright © 2026 [mAI][profile-link]. <br />
This project is [mAI Community License](./LICENSE) licensed.

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[blog]: https://mprojects-officiel.vercel.app/blog
[changelog]: https://mprojects-officiel.vercel.app/m-ai
[chat-plugin-sdk]: https://github.com/lobehub/chat-plugin-sdk
[chat-plugin-template]: https://github.com/lobehub/chat-plugin-template
[chat-plugins-gateway]: https://github.com/lobehub/chat-plugins-gateway
[codecov-link]: https://codecov.io/gh/mAI/mAI
[codecov-shield]: https://img.shields.io/codecov/c/github/mAI/mAI?labelColor=black&style=flat-square&logo=codecov&logoColor=white
[codespaces-link]: https://codespaces.new/mDevsLabs/mAI
[codespaces-shield]: https://github.com/codespaces/badge.svg
[deploy-button-image]: https://vercel.com/button
[deploy-link]: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FmDevsLabs%2FmAI&env=OPENAI_API_KEY&envDescription=Find%20your%20OpenAI%20API%20Key%20by%20click%20the%20right%20Learn%20More%20button.&envLink=https%3A%2F%2Fplatform.openai.com%2Faccount%2Fapi-keys&project-name=mAI&repository-name=mAI
[deploy-on-alibaba-cloud-button-image]: https://service-info-public.oss-cn-hangzhou.aliyuncs.com/computenest-en.svg
[deploy-on-alibaba-cloud-link]: https://computenest.console.aliyun.com/service/instance/create/default?type=user&ServiceName=mAI%E7%A4%BE%E5%8C%BA%E7%89%88
[deploy-on-repocloud-button-image]: https://d16t0pc4846x52.cloudfront.net/deploylobe.svg
[deploy-on-repocloud-link]: https://repocloud.io/details/?app_id=248
[deploy-on-sealos-button-image]: https://raw.githubusercontent.com/labring-actions/templates/main/Deploy-on-Sealos.svg
[deploy-on-sealos-link]: https://template.usw.sealos.io/deploy?templateName=mAI-db
[deploy-on-zeabur-button-image]: https://zeabur.com/button.svg
[deploy-on-zeabur-link]: https://zeabur.com/templates/VZGGTI
[discord-link]: https://discord.gg/fV7zwdGPpY
[discord-shield]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=flat-square
[discord-shield-badge]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=for-the-badge
[docker-pulls-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-pulls-shield]: https://img.shields.io/docker/pulls/lobehub/lobe-chat?color=45cc11&labelColor=black&style=flat-square&sort=semver
[docker-release-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-release-shield]: https://img.shields.io/docker/v/lobehub/lobe-chat?color=369eff&label=docker&labelColor=black&logo=docker&logoColor=white&style=flat-square&sort=semver
[docker-size-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-size-shield]: https://img.shields.io/docker/image-size/lobehub/lobe-chat?color=369eff&labelColor=black&style=flat-square&sort=semver
[docs]: https://mAI.com/docs/usage/start
[docs-dev-guide]: https://mAI.com/docs/development/start
[docs-docker]: https://mAI.com/docs/self-hosting/server-database/docker-compose
[docs-env-var]: https://mAI.com/docs/self-hosting/environment-variables
[docs-function-call]: https://mAI.com/blog/openai-function-call
[docs-plugin-dev]: https://mAI.com/docs/usage/plugins/development
[docs-self-hosting]: https://mAI.com/docs/self-hosting/start
[docs-upstream-sync]: https://mAI.com/docs/self-hosting/advanced/upstream-sync
[fossa-license-link]: https://app.fossa.com/projects/git%2Bgithub.com%2FmAI%2FmAI
[fossa-license-shield]: https://app.fossa.com/api/projects/git%2Bgithub.com%mDevsLabs%2FmAI.svg?type=large
[github-action-release-link]: https://github.com/actions/workflows/mDevsLabs/mAI/release.yml
[github-action-release-shield]: https://img.shields.io/github/actions/workflow/status/mDevsLabs/mAI/release.yml?label=release&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-action-test-link]: https://github.com/actions/workflows/mDevsLabs/mAI/test.yml
[github-action-test-shield]: https://img.shields.io/github/actions/workflow/status/mDevsLabs/mAI/test.yml?label=test&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-contributors-link]: https://github.com/mDevsLabs/mAI/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/mDevsLabs/mAI?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/mDevsLabs/mAI/network/members
[github-forks-shield]: https://img.shields.io/github/forks/mDevsLabs/mAI?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/mDevsLabs/mAI/issues
[github-issues-shield]: https://img.shields.io/github/issues/mDevsLabs/mAI?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/mDevsLbas/mAI/blob/canary/LICENSE
[github-license-shield]: https://img.shields.io/badge/license-apache%202.0-white?labelColor=black&style=flat-square
[github-project-link]: https://github.com/mDevsLabs/mAI/projects
[github-release-link]: https://github.com/mDevsLabs/mAI/releases
[github-release-shield]: https://img.shields.io/github/v/release/mDevsLabs/mAI?color=369eff&labelColor=black&logo=github&style=flat-square
[github-releasedate-link]: https://github.com/mDevsLabs/mAI/releases
[github-releasedate-shield]: https://img.shields.io/github/release-date/mDevsLabs/mAI?labelColor=black&style=flat-square
[github-stars-link]: https://github.com/mDevsLabs/mAI/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/mDevsLabs/mAI?color=ffcb47&labelColor=black&style=flat-square
[image-banner]: ./public/avatars/may.PNG
[image-star]: https://github.com/user-attachments/assets/3216e25b-186f-4a54-9cb4-2f124aec0471
[issues-link]: https://img.shields.io/github/issues/lobehub/mAI.svg?style=flat
[lobe-chat-plugins]: https://github.com/lobehub/lobe-chat-plugins
[lobe-commit]: https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-commit
[lobe-i18n]: https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-i18n
[lobe-icons-github]: https://github.com/lobehub/lobe-icons
[lobe-icons-link]: https://www.npmjs.com/package/@lobehub/icons
[lobe-icons-shield]: https://img.shields.io/npm/v/@lobehub/icons?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-lint-github]: https://github.com/lobehub/lobe-lint
[lobe-lint-link]: https://www.npmjs.com/package/@lobehub/lint
[lobe-lint-shield]: https://img.shields.io/npm/v/@lobehub/lint?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-midjourney-webui]: https://github.com/lobehub/lobe-midjourney-webui
[lobe-theme]: https://github.com/lobehub/sd-webui-lobe-theme
[lobe-tts-github]: https://github.com/lobehub/lobe-tts
[lobe-tts-link]: https://www.npmjs.com/package/@lobehub/tts
[lobe-tts-shield]: https://img.shields.io/npm/v/@lobehub/tts?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-ui-github]: https://github.com/lobehub/lobe-ui
[lobe-ui-link]: https://www.npmjs.com/package/@lobehub/ui
[lobe-ui-shield]: https://img.shields.io/npm/v/@lobehub/ui?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[official-site]: https://mprojects-officiel.vercel.app
[pr-welcome-link]: https://github.com/mDevsLabs/mAI/pulls
[pr-welcome-shield]: https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/mDevsLabs
[share-linkedin-link]: https://linkedin.com/feed
[share-linkedin-shield]: https://img.shields.io/badge/-share%20on%20linkedin-black?labelColor=black&logo=linkedin&logoColor=white&style=flat-square
[share-mastodon-link]: https://mastodon.social/share?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20mAI%20-%20An%20open-source,%20extensible%20%28Function%20Calling%29,%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20https://github.com/mDevsLabs/mAI%20#chatbot%20#chatGPT%20#openAI
[share-mastodon-shield]: https://img.shields.io/badge/-share%20on%20mastodon-black?labelColor=black&logo=mastodon&logoColor=white&style=flat-square
[share-reddit-link]: https://www.reddit.com/submit?title=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20mAI%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2FmDevsLabsI%2FmAI
[share-reddit-shield]: https://img.shields.io/badge/-share%20on%20reddit-black?labelColor=black&logo=reddit&logoColor=white&style=flat-square
[share-telegram-link]: https://t.me/share/url"?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20mAI%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2FmAI%2FmAI
[share-telegram-shield]: https://img.shields.io/badge/-share%20on%20telegram-black?labelColor=black&logo=telegram&logoColor=white&style=flat-square
[share-weibo-link]: http://service.weibo.com/share/share.php?sharesource=weibo&title=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20mAI%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2FmAI%2FmAI
[share-weibo-shield]: https://img.shields.io/badge/-share%20on%20weibo-black?labelColor=black&logo=sinaweibo&logoColor=white&style=flat-square
[share-whatsapp-link]: https://api.whatsapp.com/send?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20mAI%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20https%3A%2F%2Fgithub.com%2FmAI%2FmAI%20%23chatbot%20%23chatGPT%20%23openAI
[share-whatsapp-shield]: https://img.shields.io/badge/-share%20on%20whatsapp-black?labelColor=black&logo=whatsapp&logoColor=white&style=flat-square
[share-x-link]: https://x.com/intent/tweet?hashtags=chatbot%2CchatGPT%2CopenAI&text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20mAI%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.&url=https%3A%2F%2Fgithub.com%2FmAI%2FmAI
[share-x-shield]: https://img.shields.io/badge/-share%20on%20x-black?labelColor=black&logo=x&logoColor=white&style=flat-square
[submit-agents-link]: https://github.com/mDevsLabs/mAI-agents
[submit-agents-shield]: https://img.shields.io/badge/🤖/🏪_submit_agent-%E2%86%92-c4f042?labelColor=black&style=for-the-badge
[submit-plugin-link]: https://github.com/mDevsLabs/mAI-plugins
[submit-plugin-shield]: https://img.shields.io/badge/🧩/🏪_submit_plugin-%E2%86%92-95f3d9?labelColor=black&style=for-the-badge
[vercel-link]: https://mprojects-officiel.vercel.app
[vercel-shield]: https://img.shields.io/badge/vercel-online-55b467?labelColor=black&logo=vercel&style=flat-square

