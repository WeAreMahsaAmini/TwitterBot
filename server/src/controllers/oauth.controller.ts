import { TwitterCLient } from '@/clients/twitter.client'
import { twitterOauth } from '@/middlewares/twitter-oauth.middelware'
import { createUser } from '@/repositories/user.repository'
import { Request } from 'express'
import { Controller, Get, Req, UseBefore } from 'routing-controllers'

@Controller('/oauth')
@UseBefore(twitterOauth)
export class OAuthController {
  twitterClient = new TwitterCLient()

  @Get()
  async giveAccess(@Req() req: Request) {
    const tokenSet = req.session.tokenSet
    if (!tokenSet) {
      return `Get access from Twitter failed.`
    }

    const twitterUser = await this.twitterClient.getAuthUser(tokenSet.access_token)
    const user = await createUser({
      ...twitterUser,
      accessToken: tokenSet.access_token,
      refreshToken: tokenSet.refresh_token,
    })
    return { user, tokenSet }
  }

  @Get('/callback')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async callback() {}
}
