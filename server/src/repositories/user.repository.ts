import { PrismaClient, User } from '@prisma/client'

const client = new PrismaClient()

type UserWithoutId = Omit<User, 'id'>
type PartialUser = Partial<UserWithoutId>

export const createUser = async (user: UserWithoutId): Promise<User> => {
  return await client.user.create({ data: user })
}

export const updateUser = async (id: string, data: PartialUser): Promise<User> => {
  return await client.user.update({ where: { id }, data })
}
