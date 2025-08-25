// Simple JWT decode for extracting role
export function decodeJwt(token: string): { role?: string } {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    // Microsoft claims role
    const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return { role };
  } catch {
    return {};
  }
}
