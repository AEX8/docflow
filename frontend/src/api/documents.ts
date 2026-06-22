import client from './client'
import type { Document, DocumentWithURL } from '../types'

export const uploadDocument = async (file: File): Promise<Document> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await client.post<Document>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const listDocuments = async (): Promise<Document[]> => {
  const response = await client.get<Document[]>('/documents/')
  return response.data
}

export const getDocument = async (id: string): Promise<DocumentWithURL> => {
  const response = await client.get<DocumentWithURL>(`/documents/${id}`)
  return response.data
}

export const deleteDocument = async (id: string): Promise<void> => {
  await client.delete(`/documents/${id}`)
}