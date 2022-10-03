import { TwitterCLient } from '@clients/twitter.client'
import {
  fetchForLibertyAccounts,
  updateForLibertyAccount,
} from '@repositories/for-liberty-account.repository'
import { fetchUser, updateUser } from '@repositories/user.repository'
import { CronJob } from 'cron'

export const populateForLiberty = new CronJob(
  '*/15 * * * *',
  async () => {
    console.log('Populating For Liberty ...')

    const accounts = await fetchForLibertyAccounts()
    const forLibertyAccount = accounts.find(account => account.language === 'fa')
    const forLibertyUser = await fetchUser(forLibertyAccount.userId)

    const twitterClient = new TwitterCLient(forLibertyUser)
    const tweets = await twitterClient.getTopTweets({
      query: 'برای (#مهساـامینی OR #MahsaAmini OR #اعتصاباتـسراسری) -is:retweet lang:fa',
      take: 50,
      startsWith: 'برای',
      sinceTweetId: forLibertyAccount.lastTweetId,
    })

    const { accessToken, refreshToken } = await twitterClient.refreshToken()
    await updateUser(forLibertyUser.id, { accessToken, refreshToken })

    for (const tweet of tweets) {
      twitterClient.retweet(tweet.id)
      await updateForLibertyAccount(forLibertyAccount.id, { lastTweetId: tweet.id })
    }

    console.log('Populating For Liberty Finished!')
  },
  null,
  false,
  'America/Los_Angeles',
)
