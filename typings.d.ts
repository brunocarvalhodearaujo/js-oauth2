type Token = {
  access_token: string,
  token_type: string,
  expires_in: number,
  refresh_token: string
}

type User = {
  username: string,
  password: string
}

declare class Keychain {
  setToken (token: Token): Promise<void>
  getToken (): Promise<Token>
  removeToken (): Promise<boolean>
  getAuthorizationHeader (): Promise<string>
}

type params = {
  baseUrl: string,
  clientId: string,
  clientSecret?: string,
  grantPath?: string,
  revokePath?: string,
  interceptRequest: boolean,
  keychain?: Keychain
}

declare class OAuth2 {
  constructor (params: params)
  isAuthenticated (): Promise<boolean>
  getAccessToken (user: User, options?: RequestInfo): Promise<Token>
  getRefreshToken (user: User, options?: RequestInfo): Promise<Token>
  revokeToken (): Promise<boolean>
  onError (callback: Function): void
  stopHttpIntercept (): void
}

export default OAuth2
export { Keychain as AbstractKeychain }
