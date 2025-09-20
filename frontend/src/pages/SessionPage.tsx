import { useParams } from 'react-router-dom'

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Innovation Session</h1>
        <p className="text-gray-600">Session ID: {sessionId}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Overview</h3>
            <p className="text-gray-600">
              This is the main session view where you can see the overall progress 
              and navigate between the three phases of the Stanford Biodesign methodology.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h4 className="text-md font-semibold text-gray-900 mb-2">Phase Progress</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Identify</span>
                <span className="phase-indicator phase-identify">Not Started</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Invent</span>
                <span className="phase-indicator phase-invent">Not Started</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Implement</span>
                <span className="phase-indicator phase-implement">Not Started</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
