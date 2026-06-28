## 2026-06-28 - [Fix XSS in StructuredData component]
**Vulnerability:** XSS vulnerability in `StructuredData` component due to direct stringification of `ld` object.
**Learning:** When using `JSON.stringify` within `dangerouslySetInnerHTML` for `application/ld+json` scripts, the resulting JSON is not automatically escaped. An attacker can inject `</script><script>alert('XSS')</script>` to execute arbitrary JS.
**Prevention:** Always replace `<` with its unicode equivalent `<` or use a dedicated serialization library when injecting JSON strings into HTML contexts.
