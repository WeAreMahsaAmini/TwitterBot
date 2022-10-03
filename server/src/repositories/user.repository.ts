import { User } from '@/interfaces/users.interface'
import { PrismaClient } from '@prisma/client'

const client = new PrismaClient()

export const createUser = async (user: User): Promise<User> => {
  return await client.user.create({ data: user })
}

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  return await client.user.update({ where: { id }, data })
}
