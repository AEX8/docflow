import client from './client'
import type { Token, User } from '../types'

export const login = async (email: string, password: string): Promise<Token> => {
  const response = await client.post<Token>('/auth/login', { email, password })
  return response.data
}

export const register = async (name: string, email: string, password: string): Promise<User> => {
  const response = await client.post<User>('/auth/register', { name, email, password })
  return response.data
}