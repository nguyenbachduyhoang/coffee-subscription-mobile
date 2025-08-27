// Decode JWT payload and extract common claims (role, sub, name, phone)
export function decodeJwt(
  token: string
): { role?: string; sub?: string; name?: string; phone?: string } {
  try {
    const base64Url = token.split('.')[1] || '';
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = JSON.parse(atob(padded));

    const role =
      json['role'] ||
      (Array.isArray(json['roles']) ? json['roles'][0] : undefined) ||
      json['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    const sub =
      json['sub'] ||
      json['nameid'] ||
      json['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    const name =
      json['name'] ||
      json['unique_name'] ||
      json['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

    const phone =
      json['phone'] ||
      json['phone_number'] ||
      json['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone'];

    return { role, sub, name, phone };
  } catch {
    return {};
  }
}
