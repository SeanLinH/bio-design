import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, File, X, FileText, Image, Archive } from 'lucide-react'

interface DocumentUploadZoneProps {
  onFilesUploaded: (files: File[]) => void
  uploadedFiles: File[]
  maxFiles?: number
  acceptedTypes?: string[]
  maxSize?: number // in bytes
}

const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  onFilesUploaded,
  uploadedFiles,
  maxFiles = 10,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx', '.jpg', '.jpeg', '.png'],
  maxSize = 10 * 1024 * 1024 // 10MB
}) => {
  // Helpers MUST be declared before use
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getMimeType = (extension: string): string => {
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    }
    return mimeTypes[extension] || '*/*'
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter files by size and type
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} is too large (${formatFileSize(file.size)})`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      onFilesUploaded(validFiles)
    }
  }, [onFilesUploaded, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - uploadedFiles.length,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[getMimeType(type)] = [type]
      return acc
    }, {} as Record<string, string[]>)
  })

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop()
    switch (ext) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500" />
      case 'txt':
        return <FileText className="w-5 h-5 text-gray-500" />
      case 'csv':
      case 'xlsx':
        return <Archive className="w-5 h-5 text-green-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="w-5 h-5 text-purple-500" />
      default:
        return <File className="w-5 h-5 text-gray-500" />
    }
  }

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    onFilesUploaded(newFiles)
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : uploadedFiles.length >= maxFiles
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <input {...getInputProps()} disabled={uploadedFiles.length >= maxFiles} />
            
            <div className="flex flex-col items-center space-y-3">
              <Upload className={`w-12 h-12 ${
                isDragActive ? 'text-blue-500' : 'text-gray-400'
              }`} />
              
              {uploadedFiles.length >= maxFiles ? (
                <div>
                  <p className="text-gray-500 font-medium">Maximum files reached</p>
                  <p className="text-sm text-gray-400">Remove some files to upload more</p>
                </div>
              ) : isDragActive ? (
                <div>
                  <p className="text-blue-600 font-medium">Drop files here</p>
                  <p className="text-sm text-blue-500">Release to upload</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 font-medium">
                    Drag & drop files here, or{' '}
                    <span className="text-blue-600 underline">browse</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supports: {acceptedTypes.join(', ')} up to {formatFileSize(maxSize)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {uploadedFiles.length}/{maxFiles} files uploaded
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Uploaded Files</h4>
                <Badge variant="secondary" className="text-xs">
                  {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.name)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Type Information */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-red-50 rounded-lg">
          <FileText className="w-6 h-6 text-red-500 mx-auto mb-1" />
          <p className="text-xs font-medium text-red-700">Documents</p>
          <p className="text-xs text-red-600">PDF, DOC, TXT</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <Archive className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-xs font-medium text-green-700">Data</p>
          <p className="text-xs text-green-600">CSV, XLSX</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <Image className="w-6 h-6 text-purple-500 mx-auto mb-1" />
          <p className="text-xs font-medium text-purple-700">Images</p>
          <p className="text-xs text-purple-600">JPG, PNG</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Upload className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-xs font-medium text-blue-700">Upload</p>
          <p className="text-xs text-blue-600">Max {formatFileSize(maxSize)}</p>
        </div>
      </div>
    </div>
  )
}

export default DocumentUploadZone
