import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { biodesignService } from '@/services/biodesignService'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  data?: any
}

const ConnectionTestPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const tests = [
    {
      name: 'Health Check',
      test: () => biodesignService.checkHealth()
    },
    {
      name: 'API Info',
      test: () => biodesignService.getApiInfo()
    },
    {
      name: 'List Agents',
      test: () => biodesignService.getAgents()
    },
    {
      name: 'List Sessions',
      test: () => biodesignService.listSessions()
    },
    {
      name: 'Start Simple Debate',
      test: () => biodesignService.startDebate({
        topic: 'Test debate topic for connectivity verification',
        max_rounds: 1
      })
    }
  ]

  const runTests = async () => {
    setIsRunning(true)
    setResults([])

    for (const test of tests) {
      const result: TestResult = {
        name: test.name,
        status: 'pending',
        message: 'Running...'
      }
      
      setResults(prev => [...prev, result])

      try {
        const data = await test.test()
        result.status = 'success'
        result.message = 'Success'
        result.data = data
      } catch (error) {
        result.status = 'error'
        result.message = error instanceof Error ? error.message : 'Unknown error'
      }

      setResults(prev => prev.map(r => r.name === test.name ? result : r))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'border-blue-200 bg-blue-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Frontend-Backend Connection Test
          </CardTitle>
          <CardDescription>
            Test all API endpoints to verify frontend-backend connectivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning && <Loader2 className="w-4 h-4 animate-spin" />}
              Run Connection Tests
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setResults([])}
              disabled={isRunning}
            >
              Clear Results
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Test Results:</h3>
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-sm font-medium cursor-pointer text-blue-600 hover:text-blue-800">
                        View Response Data
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {results.length > 0 && !isRunning && (
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <p className="text-sm">
                Tests completed. {results.filter(r => r.status === 'success').length} succeeded, {' '}
                {results.filter(r => r.status === 'error').length} failed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Connection Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Frontend Configuration</h4>
              <ul className="text-sm space-y-1">
                <li><strong>Environment:</strong> {import.meta.env.MODE}</li>
                <li><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</li>
                <li><strong>Port:</strong> {window.location.port || '5173'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Expected Backend</h4>
              <ul className="text-sm space-y-1">
                <li><strong>Backend URL:</strong> http://localhost:8000</li>
                <li><strong>Health Check:</strong> /health</li>
                <li><strong>API Version:</strong> v1</li>
                <li><strong>Docs:</strong> http://localhost:8000/docs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ConnectionTestPage
