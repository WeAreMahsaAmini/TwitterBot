export interface TwitterUser {
  id: string
  username: string
  name: string
  protected: boolean
  verified: boolean
}

export interface User extends TwitterUser {
  accessToken: string
  refreshToken: string
}
