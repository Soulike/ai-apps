export class GitHubTokenStore {
  private static token: string | undefined;

  static set(token: string): void {
    GitHubTokenStore.token = token;
  }

  static get(): string | undefined {
    return GitHubTokenStore.token;
  }
}
