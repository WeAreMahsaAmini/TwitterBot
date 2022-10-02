import { UserDto } from '@/dtos/users.dto'
import { twitterOauth } from '@/middlewares/twitter-oauth.middelware'
import { Request } from 'express'
import { Controller, Get, Req, UseBefore } from 'routing-controllers'
import { request } from 'undici'

@Controller('/oauth')
@UseBefore(twitterOauth)
export class OAuthController {
  @Get()
  async giveAccess(@Req() req: Request) {
    const tokenSet = req.session.tokenSet
    if (!tokenSet) {
      return `Get access from Twitter failed.`
    }

    const { body } = await request('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${tokenSet?.access_token}`,
      },
    })
    const user: UserDto = await body.json()
    return { user, tokenSet }
  }

  @Get('/callback')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async callback() {}
}
