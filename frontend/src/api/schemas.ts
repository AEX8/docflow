import client from './client'
import type { ExtractionSchema, ExtractionSchemaCreate } from '../types'

export const createSchema = async (data: ExtractionSchemaCreate): Promise<ExtractionSchema> => {
  const response = await client.post<ExtractionSchema>('/schemas/', data)
  return response.data
}

export const listSchemas = async (): Promise<ExtractionSchema[]> => {
  const response = await client.get<ExtractionSchema[]>('/schemas/')
  return response.data
}

export const deleteSchema = async (id: string): Promise<void> => {
  await client.delete(`/schemas/${id}`)
}