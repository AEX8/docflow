import { useState, type ChangeEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { listDocuments, uploadDocument, deleteDocument } from '../api/documents'
import { listSchemas } from '../api/schemas'
import { runExtraction } from '../api/extraction'
import type { Document, ExtractionResult } from '../types'
import type { AxiosError } from 'axios'

export default function DocumentsPage() {
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState<boolean>(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [selectedSchema, setSelectedSchema] = useState<string>('')
  const [extracting, setExtracting] = useState<boolean>(false)
  const [results, setResults] = useState<Record<string, ExtractionResult>>({})

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: listDocuments
  })

  const { data: schemas = [] } = useQuery({
    queryKey: ['schemas'],
    queryFn: listSchemas
  })

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadDocument(file)
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>
      alert('Upload failed: ' + (axiosError.response?.data?.detail || axiosError.message))
    } finally {
      setUploading(false)
    }
  }

  const handleExtract = async (): Promise<void> => {
    if (!selectedDoc || !selectedSchema) return
    setExtracting(true)
    try {
      const result = await runExtraction(selectedDoc.id, selectedSchema)
      setResults(prev => ({ ...prev, [selectedDoc.id]: result }))
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setSelectedDoc(null)
      setSelectedSchema('')
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>
      alert('Extraction failed: ' + (axiosError.response?.data?.detail || axiosError.message))
    } finally {
      setExtracting(false)
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Delete this document?')) return
    try {
      await deleteDocument(id)
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    } catch (err) {
      alert('Delete failed')
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Documents</h1>
          <p className="text-gray-400 mt-1">Upload and manage your documents</p>
        </div>
        <label className={`bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer transition-colors ${uploading ? 'opacity-50' : ''}`}>
          {uploading ? 'Uploading...' : 'Upload Document'}
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png" disabled={uploading} />
        </label>
      </div>

      {selectedDoc && (
        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-blue-500">
          <h2 className="text-lg font-semibold text-white mb-4">
            Extract from: <span className="text-blue-400">{selectedDoc.filename}</span>
          </h2>
          <div className="flex gap-4">
            <select
              value={selectedSchema}
              onChange={(e) => setSelectedSchema(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select a schema...</option>
              {schemas.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              onClick={handleExtract}
              disabled={!selectedSchema || extracting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-6 py-2 rounded-lg transition-colors"
            >
              {extracting ? 'Extracting...' : 'Run Extraction'}
            </button>
            <button
              onClick={() => setSelectedDoc(null)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Latest Extraction Result</h2>
          {Object.values(results).slice(-1).map((result, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${result.status === 'completed' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {result.status}
                </span>
                {result.confidence_score !== null && (
                  <span className="text-gray-400 text-sm">
                    Confidence: {Math.round(result.confidence_score * 100)}%
                  </span>
                )}
              </div>
              {result.extracted_data && (
                <pre className="bg-gray-800 rounded-lg p-4 text-green-300 text-sm overflow-auto">
                  {JSON.stringify(result.extracted_data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-400">Loading documents...</p>
      ) : documents.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg">No documents yet</p>
          <p className="text-gray-500 text-sm mt-1">Upload a PDF or image to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-gray-900 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{doc.filename}</p>
                <p className="text-gray-400 text-sm">
                  {(doc.file_size / 1024).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString('en-AU')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  doc.status === 'completed' ? 'bg-green-900 text-green-300' :
                  doc.status === 'failed' ? 'bg-red-900 text-red-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {doc.status}
                </span>
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  Extract
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="bg-red-900 hover:bg-red-800 px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}