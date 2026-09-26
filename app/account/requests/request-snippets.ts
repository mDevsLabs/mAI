import type { ApiRouteMethod } from "@/lib/api-key-routes";

export type RequestCodeTab = "curl" | "fetch" | "python" | "node";

export function computeRequestTargetUrl(customPath: string): string {
  let clean = customPath.trim();
  if (clean.startsWith("/")) clean = clean.substring(1);
  if (clean.startsWith("api/")) clean = clean.substring(4);
  return `https://mai.val.run/${clean}`;
}

export function buildRequestCode(params: {
  activeCodeTab: RequestCodeTab;
  bodyText: string;
  customMethod: ApiRouteMethod;
  targetUrl: string;
}): string {
  const { activeCodeTab, bodyText, customMethod, targetUrl } = params;
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer VOTRE_CLE_API",
  } as const;
  const hasBody = ["POST", "PUT"].includes(customMethod) && Boolean(bodyText.trim());
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const absoluteUrl = targetUrl.startsWith("http") ? targetUrl : `${origin}${targetUrl}`;

  if (activeCodeTab === "curl") {
    let command = `curl -X ${customMethod} "${absoluteUrl}"`;
    Object.entries(headers).forEach(([key, value]) => {
      command += ` \\\n  -H "${key}: ${value}"`;
    });
    if (hasBody) command += ` \\\n  -d '${bodyText.trim()}'`;
    return command;
  }

  if (activeCodeTab === "fetch") {
    return `fetch("${absoluteUrl}", {
  method: "${customMethod}",
  headers: ${JSON.stringify(headers, null, 4)},
  ${hasBody ? `body: JSON.stringify(${bodyText.trim()})` : ""}
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
  }

  if (activeCodeTab === "python") {
    return `import requests

url = "${absoluteUrl}"
headers = ${JSON.stringify(headers, null, 4)}
${hasBody ? `payload = ${bodyText.trim()}` : ""}

response = requests.${customMethod.toLowerCase()}(url, headers=headers${hasBody ? ", json=payload" : ""})
print(response.status_code)
print(response.json())`;
  }

  return `const axios = require('axios');

const config = {
  method: '${customMethod.toLowerCase()}',
  url: '${absoluteUrl}',
  headers: ${JSON.stringify(headers, null, 4)}${hasBody ? `,\n  data: ${bodyText.trim()}` : ""}
};

axios(config)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`;
}
