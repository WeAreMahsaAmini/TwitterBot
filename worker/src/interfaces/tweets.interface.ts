export interface Tweet {
  id: string
  text: string
  lang: string
  authorId: string
  createdAt: Date
  public_metrics: {
    retweetCount: number
    replyCount: number
    likeCount: number
    quoteCount: number
  }
  popularity: number
}

export interface SearchTweetResponse {
  tweets: Tweet[]
  resultCount: number
  nextToken: string
}
