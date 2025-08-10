import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { X, Settings, ExternalLink } from "lucide-react"
import { usePreferences } from "../context/preferences-context"
import { UpdateUserPreferencesRequest } from "../lib/api/chat"

interface ChatSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const CHARACTERISTIC_OPTIONS = [
  "humorous",
  "professional", 
  "casual",
  "formal",
  "technical",
  "friendly",
  "concise",
  "detailed",
  "creative",
  "analytical"
]

export default function ChatSettingsModal({ isOpen, onClose }: ChatSettingsModalProps) {
  const { preferences, loading, updatePreferences } = usePreferences()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [userName, setUserName] = useState("")
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<string[]>([])
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [applyToNewChats, setApplyToNewChats] = useState(true)

  // Populate form when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setUserName(preferences.userName || "")
      setSelectedCharacteristics(preferences.chatbotCharacteristics || [])
      setAdditionalInfo(preferences.additionalInfo || "")
      setApplyToNewChats(preferences.applyToNewChats)
    }
  }, [preferences])

  const handleSavePreferences = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const updateData: UpdateUserPreferencesRequest = {
        userName,
        chatbotCharacteristics: selectedCharacteristics,
        additionalInfo,
        applyToNewChats
      }
      
      await updatePreferences(updateData)
      onClose() // Close modal on success
    } catch (err) {
      console.error('Failed to update preferences:', err)
      setError('Failed to update preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleCharacteristic = (characteristic: string) => {
    setSelectedCharacteristics(prev => 
      prev.includes(characteristic)
        ? prev.filter(c => c !== characteristic)
        : [...prev, characteristic]
    )
  }

  const removeCharacteristic = (characteristic: string) => {
    setSelectedCharacteristics(prev => prev.filter(c => c !== characteristic))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Settings size={20} className="text-gray-600" />
              <h2 className="text-xl font-semibold">Chat Preferences</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* User Name */}
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                    What should the chatbot call you?
                  </label>
                  <input
                    type="text"
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your preferred name"
                  />
                </div>

                {/* Chatbot Characteristics */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chatbot Characteristics
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Select how you want the chatbot to behave
                  </p>
                  
                  {/* Selected characteristics */}
                  {selectedCharacteristics.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {selectedCharacteristics.map((characteristic) => (
                          <span
                            key={characteristic}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {characteristic}
                            <button
                              onClick={() => removeCharacteristic(characteristic)}
                              className="hover:bg-blue-200 rounded-full p-0.5"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Available characteristics */}
                  <div className="grid grid-cols-2 gap-2">
                    {CHARACTERISTIC_OPTIONS.map((characteristic) => (
                      <button
                        key={characteristic}
                        onClick={() => toggleCharacteristic(characteristic)}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                          selectedCharacteristics.includes(characteristic)
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {characteristic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional preferences
                  </label>
                  <textarea
                    id="additionalInfo"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Describe any specific preferences..."
                  />
                </div>

                {/* Apply to New Chats */}
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="applyToNewChats"
                      checked={applyToNewChats}
                      onChange={(e) => setApplyToNewChats(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="applyToNewChats" className="ml-2 block text-sm text-gray-700">
                      Apply to new chats
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200">
            <Link
              to="/settings/personalization"
              onClick={onClose}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <ExternalLink size={16} />
              Open full settings
            </Link>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                disabled={saving || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
