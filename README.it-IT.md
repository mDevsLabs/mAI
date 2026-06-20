<div align="center"><a name="readme-top"></a>

[![mAI](./public/avatars/may.PNG)][vercel-link]

# mAI

mAI organizza i tuoi agenti per operare 24/7.

Recluta, pianifica e gestisce i report di tutto il tuo team di IA.

Mantieni il controllo — senza bisogno di rimanere online.

[Français](./README.md) · [English](./README.en-US.md) · [Español](./README.es-ES.md) · [Deutsch](./README.de-DE.md) · **Italiano** · [Site Officiel][official-site] · [Changelog][changelog] · [Documents][docs] · [Blog][blog] · [Feedback][github-issues-link]

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

**Condividi il Repository mAI**

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
<summary><kbd>Tabella dei Contenuti</kbd></summary>

#### TOC

- [👋🏻 Iniziare & Unirsi alla nostra Community](#-iniziare--unirsi-alla-nostra-community)
- [✨ Funzionalità](#-funzionalità)
- [🛳 Hosting Autonomo](#-hosting-autonomo)
- [📦 Ecosistema](#-ecosistema)
- [🧩 Plugin](#-plugin)
- [⌨️ Sviluppo Locale](#️-sviluppo-locale)
- [🤝 Contribuire](#-contribuire)
- [❤️ Sponsor](#️-sponsor)
- [🔗 Altri Prodotti](#-altri-prodotti)

####

<br/>

</details>

<br/>

## 👋🏻 Iniziare & Unirsi alla nostra Community

Siamo un gruppo di ingegneri-designer appassionati, con l'obiettivo di fornire componenti e strumenti di design moderno per l'IA generativa.
Adottando un approccio aperto, miriamo a offrire a sviluppatori e utenti un ecosistema di prodotti trasparente e amichevole.

Che tu sia un utente o uno sviluppatore professionista, mAI sarà il tuo parco giochi di Agenti IA. Nota che mAI è attualmente in fase di sviluppo attivo, e i tuoi feedback sono sempre benvenuti per qualsiasi [problema][issues-link] riscontrato.

| [![][discord-shield-badge]][discord-link] | Entra nella nostra community Discord! Qui puoi connetterti con sviluppatori e altri utenti entusiasti di mAI. |
| :--- | :--- |

> [!IMPORTANT]
>
> **Star Us**, riceverai tutte le notifiche di rilascio da GitHub senza alcun ritardo ~ ⭐️

## ✨ Funzionalità

Gli agenti di oggi sono strumenti una tantum guidati da compiti. Mancano di contesto, vivono isolati e richiedono passaggi manuali tra diverse finestre e modelli. mAI cambia tutto.

Con mAI, passa al livello successivo. In mAI, trattiamo gli **Agenti come unità di lavoro**, fornendo un'infrastruttura in cui umani e agenti co-evolvono.

- **Operatore**: Assume, pianifica e genera report su tutto il tuo team IA.
- **Creare**: Crea agenti personalizzati in pochi secondi con il nostro Builder.
- **Collaborare**: Gruppi di agenti che collaborano in parallelo.
- **Evolvere**: Memoria personale modificabile per un apprendimento continuo.

## 🛳 Hosting Autonomo

mAI fornisce una versione self-hosted facile da distribuire tramite Vercel, Alibaba Cloud e [Docker Image][docker-release-link].

### `A` Distribuzione su Vercel, Zeabur, Sealos o Alibaba Cloud

Fai clic sul pulsante qui sotto per avviare la distribuzione immediata:

| Deploy con Vercel | Deploy con Zeabur | Deploy con Sealos | Deploy con RepoCloud | Deploy con Alibaba Cloud |
| :---: | :---: | :---: | :---: | :---: |
| [![][deploy-button-image]][deploy-link] | [![][deploy-on-zeabur-button-image]][deploy-on-zeabur-link] | [![][deploy-on-sealos-button-image]][deploy-on-sealos-link] | [![][deploy-on-repocloud-button-image]][deploy-on-repocloud-link] | [![][deploy-on-alibaba-cloud-button-image]][deploy-on-alibaba-cloud-link] |

### `B` Distribuzione con Docker

```fish
$ mkdir mAI-db && cd mAI-db
bash <(curl -fsSL https://lobe.li/setup.sh)
docker compose up -d
```

> [!NOTE]
>
> Per istruzioni dettagliate sulla distribuzione con Docker, fare riferimento alla [Guida di Distribuzione Docker][docs-docker]

## 📦 Ecosistema

| NPM | Repository | Descrizione | Versione |
| :--- | :--- | :--- | :--- |
| [@lobehub/ui][lobe-ui-link] | [lobehub/lobe-ui][lobe-ui-github] | Libreria di componenti UI open-source per applicazioni web AIGC. | [![][lobe-ui-shield]][lobe-ui-link] |
| [@lobehub/icons][lobe-icons-link] | [lobehub/lobe-icons][lobe-icons-github] | Raccolta di loghi e icone SVG per modelli AI. | [![][lobe-icons-shield]][lobe-icons-link] |
| [@lobehub/tts][lobe-tts-link] | [lobehub/lobe-tts][lobe-tts-github] | Libreria React Hooks TTS/STT di alta qualità. | [![][lobe-tts-shield]][lobe-tts-link] |
| [@lobehub/lint][lobe-lint-link] | [lobehub/lobe-lint][lobe-lint-github] | Configurazioni di linting (ESLint, Stylelint, Prettier) per mAI. | [![][lobe-lint-shield]][lobe-lint-link] |

## 🧩 Plugin

I plugin estendono le capacità di [Function Calling][docs-function-call] di mAI.

- [lobe-chat-plugins][lobe-chat-plugins]: Indice dei plugin disponibili.
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]: SDK per lo sviluppo di plugin.
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]: Gateway per i plugin.

## ⌨️ Sviluppo Locale

```fish
$ git clone https://github.com/mDevsLabs/mAI.git
$ cd mAI
$ pnpm install
$ pnpm dev
```

---

Copyright © 2026 [mAI][profile-link]. <br />
Questo progetto è rilasciato sotto licenza [mAI Community License](./LICENSE).

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[blog]: https://mprojects.odoo.com/blog
[changelog]: https://mprojects.odoo.com/m-ai
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
[github-license-link]: https://github.com/mDevsLbas/mAI/Canary/LICENSE
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
[official-site]: https://mprojects.odoo.com
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
