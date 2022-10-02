import { DOMAIN, TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from '@/config'
import { twitterOAuth2 } from 'twitter-oauth2'

export const twitterOauth = twitterOAuth2({
  client_id: TWITTER_CLIENT_ID,
  client_secret: TWITTER_CLIENT_SECRET,
  redirect_uri: `${DOMAIN}/oauth`,
  scope: 'tweet.read users.read offline.access',
})
