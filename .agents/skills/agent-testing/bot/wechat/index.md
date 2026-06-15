# WeChat / 微信 Bot Testing

**App name:** `微信` or `WeChat` | **Process name:** `WeChat`

<<<<<<<< HEAD:.agents/skills/local-testing/bot/wechat/index.md
See [osascript-common.md](../osascript-common.md) for shared patterns.
========
See [references/osascript.md](../../references/osascript.md) for shared patterns.
>>>>>>>> 1fa6f47fc9f31fb26afca2b61a9c57751eaff2e0:.agents/skills/agent-testing/bot/wechat/index.md

## Activate & Navigate

```bash
# Activate WeChat
osascript -e 'tell application "微信" to activate'
sleep 1

# Search for a contact/bot (Cmd+F)
osascript -e '
tell application "System Events"
    keystroke "f" using command down
    delay 0.5
    keystroke "TestBot"
    delay 1
    key code 36  -- Enter to select
end tell
'
sleep 2
```

## Send Message

```bash
# After navigating to a chat, the input is focused
osascript -e '
tell application "System Events"
    keystroke "Hello bot!"
    delay 0.3
    key code 36
end tell
'
```

## Send Long Message (clipboard)

```bash
osascript -e '
tell application "微信" to activate
delay 0.5
set the clipboard to "Please help me with this task..."
tell application "System Events"
    keystroke "v" using command down
    delay 0.3
    key code 36
end tell
'
```

## Verify Response

```bash
sleep 10
screencapture /tmp/wechat-bot-response.png
```

## WeChat-Specific Notes

- WeChat macOS app name can be `微信` or `WeChat` depending on system language. Try both:
  ```bash
  osascript -e 'tell application "微信" to activate' 2> /dev/null \
    || osascript -e 'tell application "WeChat" to activate'
  ```
- WeChat uses **Enter** to send (not Cmd+Enter by default, but configurable)
- For multi-line messages without sending, use **Shift+Enter**:
  ```bash
  osascript -e 'tell application "System Events" to key code 36 using shift down'
  ```
- Always use clipboard paste for CJK characters — `keystroke` mangles non-ASCII

## Script

```bash
<<<<<<<< HEAD:.agents/skills/local-testing/bot/wechat/index.md
./.agents/skills/local-testing/bot/wechat/test-wechat-bot.sh "文件传输助手" "test message" 5
./.agents/skills/local-testing/bot/wechat/test-wechat-bot.sh "MyBot" "Tell me a joke" 30
========
./.agents/skills/agent-testing/bot/wechat/test-wechat-bot.sh "文件传输助手" "test message" 5
./.agents/skills/agent-testing/bot/wechat/test-wechat-bot.sh "MyBot" "Tell me a joke" 30
>>>>>>>> 1fa6f47fc9f31fb26afca2b61a9c57751eaff2e0:.agents/skills/agent-testing/bot/wechat/index.md
```
