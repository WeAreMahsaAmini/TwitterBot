import { ForLibertyAccount, PrismaClient } from '@prisma/client'

const client = new PrismaClient()

type ForLibertyAccountWithoutId = Omit<ForLibertyAccount, 'id'>
type PartialForLibertyAccount = Partial<ForLibertyAccountWithoutId>

export const createForLibertyAccounts = async (
  account: ForLibertyAccountWithoutId,
): Promise<ForLibertyAccount> => {
  return await client.forLibertyAccount.create({ data: account })
}

export const fetchForLibertyAccounts = async (): Promise<ForLibertyAccount[]> => {
  return await client.forLibertyAccount.findMany({ take: 100 })
}

export const updateForLibertyAccount = async (
  id: string,
  data: PartialForLibertyAccount,
): Promise<ForLibertyAccount> => {
  return await client.forLibertyAccount.update({ where: { id }, data })
}
