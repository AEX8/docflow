import client from './client'

export const runExtraction = async (documentId, schemaId) => {
  const response = await client.post('/extraction/', {
    document_id: documentId,
    schema_id: schemaId
  })
  return response.data
}

export const getResults = async (documentId) => {
  const response = await client.get(`/extraction/results/${documentId}`)
  return response.data
}