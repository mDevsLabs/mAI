# QQ Bot Testing

**App name:** `QQ` | **Process name:** `QQ`

<<<<<<<< HEAD:.agents/skills/agent-testing/bot/qq/index.md
See [references/osascript.md](../../references/osascript.md) for shared patterns.
========
See [osascript-common.md](../osascript-common.md) for shared patterns.
>>>>>>>> origin:.agents/skills/local-testing/bot/qq/index.md

## Activate & Navigate

```bash
osascript -e 'tell application "QQ" to activate'
sleep 1

# Search for contact/group (Cmd+F)
osascript -e '
tell application "System Events"
    keystroke "f" using command down
    delay 0.8
end tell
'
osascript -e '
set the clipboard to "bot-testing"
tell application "System Events"
    keystroke "v" using command down
    delay 1.5
    key code 36  -- Enter
end tell
'
sleep 2
```

## Send Message to Bot

```bash
osascript -e '
set the clipboard to "Hello bot!"
tell application "System Events"
    keystroke "v" using command down
    delay 0.3
    key code 36  -- Enter
end tell
'
```

## Verify Response

```bash
sleep 10
screencapture /tmp/qq-bot-response.png
```

## QQ-Specific Notes

- Enter sends message by default; Shift+Enter for newlines
- Uses `Cmd+F` for search (not `Cmd+K` like Discord/Slack/Lark)
- Always use clipboard paste for CJK characters

## Script

```bash
<<<<<<<< HEAD:.agents/skills/agent-testing/bot/qq/index.md
./.agents/skills/agent-testing/bot/qq/test-qq-bot.sh "bot-testing" "Hello bot" 15
./.agents/skills/agent-testing/bot/qq/test-qq-bot.sh "MyBot" "/help" 10
========
./.agents/skills/local-testing/bot/qq/test-qq-bot.sh "bot-testing" "Hello bot" 15
./.agents/skills/local-testing/bot/qq/test-qq-bot.sh "MyBot" "/help" 10
>>>>>>>> origin:.agents/skills/local-testing/bot/qq/index.md
```
