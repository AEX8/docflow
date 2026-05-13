import client from './client'

export const login = async (email, password) => {
  const response = await client.post('/auth/login', { email, password })
  return response.data
}

export const register = async (name, email, password) => {
  const response = await client.post('/auth/register', { name, email, password })
  return response.data
}