// Extracted from example.tsx for reuse
export function SystemSettingsContent() {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-500 mb-4">General Configuration</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Auto-refresh interval</span>
                <span className="text-white">30 seconds</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Timeout duration</span>
                <span className="text-white">5 minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Max connections</span>
                <span className="text-white">1000</span>
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-500 mb-4">Security Settings</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">SSL/TLS enabled</span>
                <span className="text-green-500">✓ Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Authentication</span>
                <span className="text-green-500">✓ Required</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-300">Rate limiting</span>
                <span className="text-green-500">✓ Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}