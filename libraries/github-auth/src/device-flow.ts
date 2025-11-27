import {getStoredToken, storeToken, deleteToken} from './token-storage.js';

const GITHUB_CLIENT_ID = '01ab8ac9400c4e429b23';
const DEVICE_CODE_URL = 'https://github.com/login/device/code';
const ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface TokenErrorResponse {
  error: string;
  error_description?: string;
}

async function requestDeviceCode(
  scopes: string[],
): Promise<DeviceCodeResponse> {
  const response = await fetch(DEVICE_CODE_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      scope: scopes.join(' '),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to request device code: ${response.statusText}`);
  }

  return response.json() as Promise<DeviceCodeResponse>;
}

async function pollForToken(
  deviceCode: DeviceCodeResponse,
): Promise<TokenResponse> {
  const {device_code, interval, expires_in} = deviceCode;
  const pollInterval = (interval + 1) * 1000; // Add 1 second buffer
  const expiresAt = Date.now() + expires_in * 1000;

  while (Date.now() < expiresAt) {
    await sleep(pollInterval);

    const response = await fetch(ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to poll for token: ${response.statusText}`);
    }

    const data = (await response.json()) as TokenResponse | TokenErrorResponse;

    if ('access_token' in data) {
      return data;
    }

    if ('error' in data) {
      switch (data.error) {
        case 'authorization_pending':
          // User hasn't authorized yet, continue polling
          continue;
        case 'slow_down':
          // We're polling too fast, wait longer next time
          await sleep(5000);
          continue;
        case 'expired_token':
          throw new Error('Authorization expired. Please try again.');
        case 'access_denied':
          throw new Error('Authorization denied by user.');
        default:
          throw new Error(
            data.error_description ?? `Authorization failed: ${data.error}`,
          );
      }
    }
  }

  throw new Error('Authorization timed out. Please try again.');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function validateToken(token: string): Promise<boolean> {
  const response = await fetch('https://api.github.com/user', {
    headers: {Authorization: `Bearer ${token}`},
  });
  return response.ok;
}

/**
 * Authenticate with GitHub using the OAuth device flow.
 *
 * First checks for a stored token in the system keychain. If found and valid,
 * returns it immediately. Otherwise, runs the OAuth device flow and stores
 * the new token.
 *
 * @param scopes - OAuth scopes to request (default: ['repo'])
 * @returns Access token for GitHub API
 */
export async function authenticateWithDeviceFlow(
  scopes: string[] = ['repo'],
): Promise<string> {
  // Check for existing token in keychain
  const existingToken = await getStoredToken();
  if (existingToken) {
    const isValid = await validateToken(existingToken);
    if (isValid) {
      console.log('✓ Using saved GitHub credentials\n');
      return existingToken;
    }
    // Token invalid, delete and re-auth
    await deleteToken();
  }

  const deviceCode = await requestDeviceCode(scopes);

  console.log('\nGitHub authentication required.');
  console.log(`Please open: ${deviceCode.verification_uri}`);
  console.log(`Enter code: ${deviceCode.user_code}\n`);
  console.log('Waiting for authorization...');

  const token = await pollForToken(deviceCode);

  // Store token in keychain for future use
  await storeToken(token.access_token);

  console.log('✓ Authenticated successfully\n');
  return token.access_token;
}
