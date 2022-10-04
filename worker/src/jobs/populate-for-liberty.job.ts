import { TwitterCLient } from '@clients/twitter.client'
import {
  fetchForLibertyAccounts,
  updateForLibertyAccount,
} from '@repositories/for-liberty-account.repository'
import { fetchUser, updateUser } from '@repositories/user.repository'

export const populateForLiberty = async () => {
  console.log('Populating For Liberty ...')

  const accounts = await fetchForLibertyAccounts()
  const forLibertyAccount = accounts.find(account => account.language === 'fa')
  const forLibertyUser = await fetchUser(forLibertyAccount.userId)
  const twitterClient = new TwitterCLient(forLibertyUser)

  if (forLibertyAccount.resetRules) {
    await twitterClient.deleteStreamRules()
    await twitterClient.setStreamRules([
      [
        'برای',
        '#مهساـامینی',
        '-is:retweet',
        '-is:reply',
        'followers_count:500..100000000',
        'following_count:0..5000',
      ].join(' '),
    ])
    await updateForLibertyAccount(forLibertyAccount.id, { resetRules: false })
  }

  await twitterClient.streamTweets(async tweet => {
    console.log('tweet', tweet)
    if (tweet.text.startsWith('برای')) {
      const validToken = await twitterClient.validateToken()
      if (!validToken) {
        const { accessToken, refreshToken } = await twitterClient.refreshToken()
        await updateUser(forLibertyUser.id, { accessToken, refreshToken })
      }
      await twitterClient.retweet(tweet.id)
    }
  })
}
