import { type BuiltinSkill } from '@lobechat/types';

import { systemPrompt } from './content';
import { toResourceMeta } from './helpers';
import agent from './references/agent';
import bot from './references/bot';
import botDiscord from './references/bot-discord';
import botFeishu from './references/bot-feishu';
import botLark from './references/bot-lark';
import botQQ from './references/bot-qq';
import botSlack from './references/bot-slack';
import botTelegram from './references/bot-telegram';
import botWechat from './references/bot-wechat';
import config from './references/config';
import doc from './references/doc';
import eval_ from './references/eval';
import file from './references/file';
import generate from './references/generate';
import kb from './references/kb';
import memory from './references/memory';
import message from './references/message';
import model from './references/model';
import plugin from './references/plugin';
import provider from './references/provider';
import search from './references/search';
import skill from './references/skill';
import topic from './references/topic';

export const LobeHubIdentifier = 'lobehub';

export const LobeHubSkill: BuiltinSkill = {
  avatar: '/avatars/may.PNG',
  content: systemPrompt,
  description:
    "Manage the LobeHub platform via the `lh` CLI — INCLUDING modifying THIS agent's own configuration. ACTIVATE this skill whenever the user asks you to: change your system prompt / instructions / persona, enable or disable tools / plugins / skills, switch model or provider, attach knowledge bases or files, edit the opening message, rename the topic, OR operate on any other platform resource (agents, topics, memory, documents, search, content generation, model/provider/plugin management, bot integrations, evals, usage stats). ALSO ACTIVATE when the user asks to connect, link, or set up a messaging platform bot — including Discord, Telegram, Slack, Feishu (飞书), Lark, QQ, or WeChat (微信) — or uses phrases like '帮我链接 Discord', 'connect my Slack', '接入飞书', '配置 QQ 机器人', 'link WeChat'. Without activation you cannot persist any change — you can only describe what you would do.",
  identifier: LobeHubIdentifier,
  name: 'lobehub',
  resources: toResourceMeta({
    'references/agent': agent,
    'references/bot': bot,
    'references/bot/discord': botDiscord,
    'references/bot/feishu': botFeishu,
    'references/bot/lark': botLark,
    'references/bot/qq': botQQ,
    'references/bot/slack': botSlack,
    'references/bot/telegram': botTelegram,
    'references/bot/wechat': botWechat,
    'references/config': config,
    'references/doc': doc,
    'references/eval': eval_,
    'references/file': file,
    'references/generate': generate,
    'references/kb': kb,
    'references/memory': memory,
    'references/message': message,
    'references/model': model,
    'references/plugin': plugin,
    'references/provider': provider,
    'references/search': search,
    'references/skill': skill,
    'references/topic': topic,
  }),
  source: 'builtin',
};
