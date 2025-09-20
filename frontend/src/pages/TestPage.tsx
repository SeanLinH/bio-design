import React, { useState, useEffect } from 'react'
import { biodesignService } from '@/services/biodesignService'

export const TestPage: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [apiInfo, setApiInfo] = useState<any>(null)
  const [sessions, setSessions] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [reflectionResult, setReflectionResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkBackendHealth()
  }, [])

  const checkBackendHealth = async () => {
    try {
      const health = await biodesignService.checkHealth()
      setHealthStatus(health)
      
      const info = await biodesignService.getApiInfo()
      setApiInfo(info)
      
      const sessionsList = await biodesignService.listSessions()
      setSessions(sessionsList)
    } catch (err) {
      console.error('Backend connection error:', err)
      setError('無法連接到後端服務')
    }
  }

  const submitReflection = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Start a multi-agent debate instead of reflection
      const response = await biodesignService.startDebate({
        topic: query.trim(),
        max_rounds: 3
      })
      
      console.log('Debate started:', response)
      
      // Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const result = await biodesignService.getDebateResult(response.session_id)
          if (result.status === 'completed') {
            setReflectionResult(result)
            clearInterval(pollInterval)
            setLoading(false)
          }
        } catch (pollError) {
          console.log('Still processing...', pollError)
        }
      }, 3000)
      
      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        setLoading(false)
      }, 120000)
      
    } catch (err) {
      console.error('Debate error:', err)
      setError('提交查詢時發生錯誤: ' + (err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          前後端連接測試
        </h1>

        {/* Backend Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">後端狀態</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-700">健康檢查</h3>
              {healthStatus ? (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {healthStatus.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(healthStatus.timestamp).toLocaleString()}
                  </p>
                </div>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  連接失敗
                </span>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-700">API 信息</h3>
              {apiInfo ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  已連接
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  未知
                </span>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-700">會話列表</h3>
              {sessions ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  已載入
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  載入中
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reflection Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">反思查詢測試</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                醫療查詢內容
              </label>
              <textarea
                id="query"
                rows={4}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="輸入醫療相關的問題或需求..."
              />
            </div>
            
            <button
              onClick={submitReflection}
              disabled={loading || !query.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '處理中...' : '提交查詢'}
            </button>
          </div>
        </div>

        {/* Reflection Results */}
        {reflectionResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">反思結果</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">會話 ID</h3>
                <p className="text-sm text-gray-600">{reflectionResult.session_id}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">狀態</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {reflectionResult.status}
                </span>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">原始查詢</h3>
                <p className="text-sm text-gray-600">{reflectionResult.original_query}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">討論輪數</h3>
                <p className="text-sm text-gray-600">{reflectionResult.discussion_rounds}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">醫療洞察</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {reflectionResult.medical_insights.map((insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">工程洞察</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {reflectionResult.engineering_insights.map((insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">最終總結</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{reflectionResult.final_summary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Raw Data Display */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">原始數據</h2>
          
          <div className="space-y-4">
            <details className="border border-gray-200 rounded p-4">
              <summary className="cursor-pointer font-medium">健康檢查響應</summary>
              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                {JSON.stringify(healthStatus, null, 2)}
              </pre>
            </details>
            
            <details className="border border-gray-200 rounded p-4">
              <summary className="cursor-pointer font-medium">API 信息響應</summary>
              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                {JSON.stringify(apiInfo, null, 2)}
              </pre>
            </details>
            
            <details className="border border-gray-200 rounded p-4">
              <summary className="cursor-pointer font-medium">會話列表響應</summary>
              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                {JSON.stringify(sessions, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
