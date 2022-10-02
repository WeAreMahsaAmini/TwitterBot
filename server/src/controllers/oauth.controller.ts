import { twitterOauth } from '@/middlewares/twitter-oauth.middelware'
import { Request, Response } from 'express'
import { Controller, Get, Req, Res, UseBefore } from 'routing-controllers'
import { request } from 'undici'

@Controller('/oauth')
@UseBefore(twitterOauth)
export class OAuthController {
  @Get()
  async giveAccess(@Req() req: Request, @Res() res: Response) {
    const tokenSet = req.session.tokenSet
    console.log('received tokens %j', req.session.tokenSet)

    if (!req.session.tokenSet) {
      res.send(`Get access from Twitter failed.`)
      return
    }
    const { body } = await request('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${tokenSet?.access_token}`,
      },
    })
    const username = (await body.json()).data.username
    res.send(`Hello ${username}!`)
  }

  @Get('/callback')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async callback() {}
}
