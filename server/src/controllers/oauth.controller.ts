import { twitterOauth } from '@/middlewares/twitter-oauth.middelware'
import { Request, Response } from 'express'
import { Controller, Get, Req, Res, UseBefore } from 'routing-controllers'

@Controller('/oauth')
@UseBefore(twitterOauth)
export class OAuthController {
  @Get()
  async giveAccess(@Req() req: Request, @Res() res: Response) {
    const tokenSet = req.session.tokenSet
    if (!tokenSet) {
      res.send(`Get access from Twitter failed.`)
      return
    }

    const { access_token, refresh_token } = tokenSet
    res.send(`Access Token: ${access_token}\nRefresh Token: ${refresh_token}`)
  }

  @Get('/callback')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async callback() {}
}
