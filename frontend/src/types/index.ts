export interface User {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
  }
  
  export interface Token {
    access_token: string
    token_type: string
  }
  
  export type DocumentStatus = 'uploaded' | 'processing' | 'completed' | 'failed'
  
  export interface Document {
    id: string
    filename: string
    file_type: string
    file_size: number
    status: DocumentStatus
    created_at: string
  }
  
  export interface DocumentWithURL extends Document {
    download_url: string
  }
  
  export type FieldType = 'string' | 'number' | 'date' | 'boolean'
  
  export interface SchemaField {
    name: string
    type: FieldType
    description: string
    required: boolean
  }
  
  export interface ExtractionSchema {
    id: string
    name: string
    description: string | null
    fields: SchemaField[]
    created_at: string
  }
  
  export interface ExtractionSchemaCreate {
    name: string
    description?: string
    fields: SchemaField[]
  }
  
  export type ExtractionStatus = 'processing' | 'completed' | 'failed'
  
  export interface ExtractionResult {
    id: string
    document_id: string
    schema_id: string
    extracted_data: Record<string, unknown> | null
    confidence_score: number | null
    status: ExtractionStatus
    error_message: string | null
    created_at: string
  }