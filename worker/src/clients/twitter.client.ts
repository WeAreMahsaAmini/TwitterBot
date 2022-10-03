import {
  TWITTER_BEARER_TOKEN,
  TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET,
  TWITTER_SEARCH_CYCLE_LIMIT,
} from '@config'
import { SearchTweetResponse, Tweet } from '@interfaces/tweets.interface'
import { User } from '@prisma/client'
import { TwitterApi } from 'twitter-api-v2'

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

  refreshToken = async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await this.client.refreshOAuth2Token(this.user.refreshToken)
    this.userClient = new TwitterApi(response.accessToken)
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    }
  }

  searchTweets = async (options: {
    query: string
    sinceTweetId?: string
    startTime?: Date
    endTime?: Date
    take?: number
    next_token?: string
  }): Promise<SearchTweetResponse> => {
    try {
      const { query, sinceTweetId, startTime, endTime, take, next_token } = options
      const result = await this.bearerClient.v2.search(query, {
        'tweet.fields': ['id', 'text', 'lang', 'author_id', 'created_at'],
        since_id: sinceTweetId ? sinceTweetId : undefined,
        sort_order: 'recency',
        start_time: startTime?.toISOString(),
        end_time: endTime?.toISOString(),
        max_results: take,
        next_token,
      })
      return {
        tweets: result.tweets.map(tweet => ({
          id: tweet.id,
          text: tweet.text,
          lang: tweet.lang,
          authorId: tweet.author_id,
          createdAt: new Date(tweet.created_at),
        })),
        resultCount: result.meta.result_count,
        nextToken: result.meta.next_token,
      }
    } catch (e) {
      console.error(JSON.stringify(e.errors))
    }
  }

  getAllTweets = async (options: {
    query: string
    startTime?: Date
    endTime?: Date
    sinceTweetId?: string
  }): Promise<Tweet[]> => {
    process.stdout.write('Fetching tweets: ')
    let result = await this.searchTweets({ ...options, take: 100 })
    let tweets = result.tweets
    let counter = 1
    while (result.nextToken && counter < (parseInt(TWITTER_SEARCH_CYCLE_LIMIT) || 10)) {
      process.stdout.write('#')
      result = await this.searchTweets({
        ...options,
        take: 100,
        next_token: result.nextToken,
      })
      tweets = [...tweets, ...result.tweets]
      counter += 1
    }
    process.stdout.write(' Done')
    return tweets
  }

  retweet = async (tweetId: string): Promise<void> => {
    await this.userClient.v2.retweet(this.user.twitterId, tweetId)
  }
}
