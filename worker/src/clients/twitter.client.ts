import { TWITTER_BEARER_TOKEN } from '@config'
import { SearchTweetResponse, Tweet } from '@interfaces/tweet.interface'
import { Client } from 'twitter-api-sdk'

export class TwitterCLient {
  private client: Client

  constructor(accessToken?: string) {
    this.client = new Client(accessToken || TWITTER_BEARER_TOKEN)
  }

  searchTweets = async (options: {
    query: string
    sinceTweetId?: string
    startTime?: Date
    endTime?: Date
    take?: number
    next_token?: string
  }): Promise<SearchTweetResponse> => {
    const { query, sinceTweetId, startTime, endTime, take, next_token } = options
    const result = await this.client.tweets.tweetsRecentSearch({
      query,
      'tweet.fields': ['id', 'text', 'lang', 'author_id', 'created_at'],
      since_id: sinceTweetId ? sinceTweetId : undefined,
      sort_order: 'recency',
      start_time: startTime?.toISOString(),
      end_time: endTime?.toISOString(),
      max_results: take,
      next_token,
    })
    return {
      tweets: result.data.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        lang: tweet.lang,
        authorId: tweet.author_id,
        createdAt: new Date(tweet.created_at),
      })),
      resultCount: result.meta.result_count,
      nextToken: result.meta.next_token,
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
    while (result.nextToken) {
      process.stdout.write('#')
      result = await this.searchTweets({
        ...options,
        take: 100,
        next_token: result.nextToken,
      })
      tweets = [...tweets, ...result.tweets]
    }
    process.stdout.write(' Done')
    return tweets
  }
}
