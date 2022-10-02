import { twitterOauth } from '@/middlewares/twitter-oauth.middelware'
import { Request, Response } from 'express'
import { Controller, Get, Post, Req, Res, UseBefore } from 'routing-controllers'
import { request } from 'undici'

@Controller('/oauth')
export class OAuthController {
  @Get()
  @UseBefore(twitterOauth)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async giveAccess() {}

  @Post('/callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    const tokenSet = req.session.tokenSet
    console.log('received tokens %j', req.session.tokenSet)
    const { body } = await request('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${tokenSet?.access_token}`,
      },
    })
    const username = (await body.json()).data.username
    res.send(`Hello ${username}!`)
  }
}
