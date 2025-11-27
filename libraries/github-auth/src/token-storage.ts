import * as keytar from 'keytar';

const SERVICE = 'repo-sentinel';
const ACCOUNT = 'github-token';

export async function getStoredToken(): Promise<string | null> {
  return keytar.getPassword(SERVICE, ACCOUNT);
}

export async function storeToken(token: string): Promise<void> {
  await keytar.setPassword(SERVICE, ACCOUNT, token);
}

export async function deleteToken(): Promise<void> {
  await keytar.deletePassword(SERVICE, ACCOUNT);
}
