import { TWITTER_BEARER_TOKEN } from '@/config'
import { TwitterUser } from '@/interfaces/users.interface'
import { Client } from 'twitter-api-sdk'

export class TwitterCLient {
  private client: Client

  constructor(accessToken?: string) {
    this.client = new Client(accessToken || TWITTER_BEARER_TOKEN)
  }

  getAuthUser = async (access_token?: string): Promise<TwitterUser> => {
    const client = access_token ? new Client(access_token) : this.client
    const { data: user } = await client.users.findMyUser({
      'user.fields': ['id', 'username', 'name', 'protected', 'verified'],
    })
    return {
      twitterId: user.id,
      name: user.name,
      username: user.username,
      protected: !!user.protected,
      verified: !!user.verified,
    }
  }
}
