export interface Token {
  access_token: string,
  token_type: string,
  expires_in: number,
  refresh_token: string
}

export interface User {
  username: string,
  password: string
}

export interface Keychain {
  setToken (token: Token): Promise<void>
  getToken (): Promise<Token>
  removeToken (): Promise<void>
  getAuthorizationHeader (): Promise<string>
}

export interface params {
  baseUrl: string,
  clientId: string,
  clientSecret?: string,
  grantPath?: string,
  revokePath?: string,
  interceptRequest: boolean,
  keychain?: Keychain
}

export default interface OAuth2 {
  constructor (params: params)
  isAuthenticated (): Promise<boolean>
  getAccessToken (user: User, options?: RequestInfo): Promise<Token>
  getRefreshToken (user: User, options?: RequestInfo): Promise<Token>
  revokeToken (): Promise<boolean>
  onError (callback: Function): void
  stopHttpIntercept (): void
}
