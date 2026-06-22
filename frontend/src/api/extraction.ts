import client from './client'
import type { ExtractionResult } from '../types'

export const runExtraction = async (documentId: string, schemaId: string): Promise<ExtractionResult> => {
  const response = await client.post<ExtractionResult>('/extraction/', {
    document_id: documentId,
    schema_id: schemaId
  })
  return response.data
}

export const getResults = async (documentId: string): Promise<ExtractionResult[]> => {
  const response = await client.get<ExtractionResult[]>(`/extraction/results/${documentId}`)
  return response.data
}