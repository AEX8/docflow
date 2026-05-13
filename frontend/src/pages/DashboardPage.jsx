import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { listDocuments } from '../api/documents'
import { listSchemas } from '../api/schemas'

export default function DashboardPage() {
  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: listDocuments
  })

  const { data: schemas = [] } = useQuery({
    queryKey: ['schemas'],
    queryFn: listSchemas
  })

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome to DocFlow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Total Documents</p>
          <p className="text-4xl font-bold text-white mt-1">{documents.length}</p>
          <Link to="/documents" className="text-blue-400 text-sm hover:underline mt-2 inline-block">
            View all →
          </Link>
        </div>
        <div className="bg-gray-900 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Extraction Schemas</p>
          <p className="text-4xl font-bold text-white mt-1">{schemas.length}</p>
          <Link to="/schemas" className="text-blue-400 text-sm hover:underline mt-2 inline-block">
            View all →
          </Link>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Documents</h2>
        {documents.length === 0 ? (
          <p className="text-gray-400">No documents yet. <Link to="/documents" className="text-blue-400 hover:underline">Upload one →</Link></p>
        ) : (
          <div className="space-y-3">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2 border-b border-gray-800">
                <div>
                  <p className="text-white text-sm font-medium">{doc.filename}</p>
                  <p className="text-gray-400 text-xs">{new Date(doc.created_at).toLocaleDateString('en-AU')}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  doc.status === 'completed' ? 'bg-green-900 text-green-300' :
                  doc.status === 'failed' ? 'bg-red-900 text-red-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}