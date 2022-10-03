export interface TwitterUser {
  twitterId: string
  username: string
  name: string
  protected: boolean
  verified: boolean
}

export interface User extends TwitterUser {
  id: string
  accessToken: string
  refreshToken: string
}
