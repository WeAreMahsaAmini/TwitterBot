export interface Tweet {
  id: string
  text: string
  lang: string
  authorId: string
  createdAt: Date
}

export interface SearchTweetResponse {
  tweets: Tweet[]
  resultCount: number
  nextToken: string
}
