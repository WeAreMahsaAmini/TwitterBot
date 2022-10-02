import { twitterOauth } from '@/middlewares/twitter-oauth.middelware'
import { Request } from 'express'
import { Controller, Get, Req, UseBefore } from 'routing-controllers'

@Controller('/oauth')
@UseBefore(twitterOauth)
export class OAuthController {
  @Get()
  async giveAccess(@Req() req: Request) {
    const tokenSet = req.session.tokenSet
    if (!tokenSet) {
      return `Get access from Twitter failed.`
    }
    return tokenSet
  }

  @Get('/callback')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async callback() {}
}
