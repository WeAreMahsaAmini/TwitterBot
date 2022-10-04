import { TWITTER_BEARER_TOKEN, TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from '@config'
import { Tweet } from '@interfaces/tweets.interface'
import { User } from '@prisma/client'
import {
  ETwitterStreamEvent,
  StreamingV2UpdateRulesAddResult,
  TwitterApi,
} from 'twitter-api-v2'

export class TwitterCLient {
  private user: User
  private client: TwitterApi
  private bearerClient: TwitterApi
  private userClient: TwitterApi

  constructor(user: User) {
    this.user = user
    this.client = new TwitterApi({
      clientId: TWITTER_CLIENT_ID,
      clientSecret: TWITTER_CLIENT_SECRET,
    })
    this.bearerClient = new TwitterApi(TWITTER_BEARER_TOKEN)
    this.userClient = new TwitterApi(this.user.accessToken)
  }

  validateToken = async () => {
    try {
      await this.userClient.v2.me()
      return true
    } catch (error) {
      return false
    }
  }

  refreshToken = async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await this.client.refreshOAuth2Token(this.user.refreshToken)
    this.userClient = new TwitterApi(response.accessToken)
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    }
  }

  deleteStreamRules = async (): Promise<void> => {
    const result = await this.bearerClient.v2.streamRules()
    const ruleIds = result.data?.map(rule => rule.id)
    if (ruleIds) {
      await this.bearerClient.v2.updateStreamRules({ delete: { ids: ruleIds } })
    }
  }

  setStreamRules = async (rules: string[]): Promise<StreamingV2UpdateRulesAddResult> => {
    return await this.bearerClient.v2.updateStreamRules({
      add: rules.map(rule => ({ value: rule })),
    })
  }

  streamTweets = async (handler: (data: Tweet) => Promise<void>): Promise<void> => {
    const stream = await this.bearerClient.v2.searchStream({
      'tweet.fields': ['id', 'text', 'lang', 'author_id', 'created_at', 'public_metrics'],
    })
    stream.on(ETwitterStreamEvent.Data, async result => {
      const tweet = result.data
      try {
        await handler({
          id: tweet.id,
          text: tweet.text,
          lang: tweet.lang,
          authorId: tweet.author_id,
          createdAt: new Date(tweet.created_at),
          public_metrics: {
            retweetCount: tweet.public_metrics.retweet_count,
            replyCount: tweet.public_metrics.reply_count,
            likeCount: tweet.public_metrics.like_count,
            quoteCount: tweet.public_metrics.quote_count,
          },
          popularity:
            5 * (tweet.public_metrics.retweet_count + tweet.public_metrics.quote_count) +
            2 * tweet.public_metrics.reply_count +
            tweet.public_metrics.like_count,
        })
      } catch (e) {
        console.error(e)
      }
    })
    await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity })
  }

  retweet = async (tweetId: string): Promise<void> => {
    try {
      await this.userClient.v2.retweet(this.user.twitterId, tweetId)
    } catch (e) {
      console.error(e)
    }
  }
}
