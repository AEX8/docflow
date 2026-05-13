import client from './client'

export const createSchema = async (data) => {
  const response = await client.post('/schemas/', data)
  return response.data
}

export const listSchemas = async () => {
  const response = await client.get('/schemas/')
  return response.data
}

export const deleteSchema = async (id) => {
  await client.delete(`/schemas/${id}`)
}