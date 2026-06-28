export const OFFICIAL_AGENT_GATEWAY_URL = 'https://agent-gateway.lobehub.com';
export const OFFICIAL_SERVER_URL =
  process.env.MAI_SERVER_URL || 
  process.env.LOBE_SERVER_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3010' : 'https://app.lobehub.com');
export const OFFICIAL_GATEWAY_URL = 'https://device-gateway.lobehub.com';
