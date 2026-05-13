import client from './client'

export const uploadDocument = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await client.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const listDocuments = async () => {
  const response = await client.get('/documents/')
  return response.data
}

export const getDocument = async (id) => {
  const response = await client.get(`/documents/${id}`)
  return response.data
}

export const deleteDocument = async (id) => {
  await client.delete(`/documents/${id}`)
}