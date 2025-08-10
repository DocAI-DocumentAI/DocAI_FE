import { useState, useEffect } from "react"
import { UpdateUserPreferencesRequest } from "../../lib/api/chat"
import { usePreferences } from "../../context/preferences-context"
import { X } from "lucide-react"

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

export default function PersonalizationSettings() {
  const { preferences, loading, error, updatePreferences } = usePreferences()
  const [saving, setSaving] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

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
      setLocalError(null)

      const updateData: UpdateUserPreferencesRequest = {
        userName,
        chatbotCharacteristics: selectedCharacteristics,
        additionalInfo,
        applyToNewChats
      }

      await updatePreferences(updateData)

      // Show success message (you can replace with toast notification)
      alert('Preferences updated successfully!')
    } catch (err) {
      console.error('Failed to update preferences:', err)
      setLocalError('Failed to update preferences. Please try again.')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Chatbot Personalization</h1>

      {(error || localError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error || localError}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* User Name */}
        <div>
          <label htmlFor="userName" className="mb-2 block font-medium">
            What DocsAI should call you
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Enter your preferred name"
          />
        </div>

        {/* Chatbot Characteristics */}
        <div>
          <label className="mb-2 block font-medium">
            Chatbot Characteristics
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Select characteristics that describe how you want the chatbot to behave
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-2xl">
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
          <label htmlFor="additionalInfo" className="mb-2 block font-medium">
            Additional preferences
          </label>
          <textarea
            id="additionalInfo"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={4}
            className="w-full max-w-2xl rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Describe any specific preferences for how the chatbot should respond (e.g., 'I prefer detailed explanations with examples', 'Keep responses concise and to the point')"
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
            <label htmlFor="applyToNewChats" className="ml-2 block text-sm">
              Apply these preferences to new chats
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            When enabled, new chat sessions will automatically use these preferences
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleSavePreferences}
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Update preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}
