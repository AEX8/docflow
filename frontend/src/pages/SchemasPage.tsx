import { useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { listSchemas, createSchema, deleteSchema } from '../api/schemas'
import type { SchemaField, FieldType } from '../types'

const FIELD_TYPES: FieldType[] = ['string', 'number', 'date', 'boolean']

export default function SchemasPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState<boolean>(false)
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [fields, setFields] = useState<SchemaField[]>([
    { name: '', type: 'string', description: '', required: true }
  ])
  const [saving, setSaving] = useState<boolean>(false)

  const { data: schemas = [], isLoading } = useQuery({
    queryKey: ['schemas'],
    queryFn: listSchemas
  })

  const addField = (): void => {
    setFields([...fields, { name: '', type: 'string', description: '', required: true }])
  }

  const updateField = <K extends keyof SchemaField>(
    index: number,
    key: K,
    value: SchemaField[K]
  ): void => {
    const updated = [...fields]
    updated[index][key] = value
    setFields(updated)
  }

  const removeField = (index: number): void => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setSaving(true)
    try {
      await createSchema({ name, description, fields })
      queryClient.invalidateQueries({ queryKey: ['schemas'] })
      setShowForm(false)
      setName('')
      setDescription('')
      setFields([{ name: '', type: 'string', description: '', required: true }])
    } catch (err) {
      alert('Failed to create schema')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Delete this schema?')) return
    try {
      await deleteSchema(id)
      queryClient.invalidateQueries({ queryKey: ['schemas'] })
    } catch (err) {
      alert('Delete failed')
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Schemas</h1>
          <p className="text-gray-400 mt-1">Define what to extract from your documents</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : 'New Schema'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create Schema</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Schema Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Invoice Extractor"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="What does this schema extract?"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">Fields</label>
                <button type="button" onClick={addField} className="text-blue-400 text-sm hover:underline">
                  + Add field
                </button>
              </div>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(index, 'name', e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Field name"
                        required
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(index, 'type', e.target.value as FieldType)}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={field.description}
                      onChange={(e) => updateField(index, 'description', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 mb-3"
                      placeholder="Description (tells Claude what to look for)"
                      required
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-gray-400">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(index, 'required', e.target.checked)}
                          className="rounded"
                        />
                        Required
                      </label>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          className="text-red-400 text-sm hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-lg font-medium transition-colors"
            >
              {saving ? 'Creating...' : 'Create Schema'}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-400">Loading schemas...</p>
      ) : schemas.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg">No schemas yet</p>
          <p className="text-gray-500 text-sm mt-1">Create a schema to define what to extract</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schemas.map((schema) => (
            <div key={schema.id} className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{schema.name}</h3>
                  {schema.description && (
                    <p className="text-gray-400 text-sm mt-1">{schema.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(schema.id)}
                  className="bg-red-900 hover:bg-red-800 px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {schema.fields.map((field, i) => (
                  <span key={i} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                    {field.name} ({field.type})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}