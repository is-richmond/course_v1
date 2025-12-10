// lib/jwtUtils.ts
export function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export function getAgentIdFromToken(token: string) {
  const decoded = decodeJWT(token);
  return decoded?.user?.agent?.id || null;
}

export function saveAgentId(agentId: string) {
  localStorage.setItem('agent_id', agentId);
}

export function getAgentId() {
  return localStorage.getItem('agent_id');
}

export function removeAgentId() {
  localStorage.removeItem('agent_id');
}