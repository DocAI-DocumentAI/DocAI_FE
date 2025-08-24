import { useState } from "react"

export default function PersonalizationSettings() {
  const [name, setName] = useState("Thomas")
  const [responseStyle, setResponseStyle] = useState("")
  const [enableNewChat, setEnableNewChat] = useState(true)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Personalization</h1>

      <div className="mb-6">
        <label htmlFor="name" className="mb-2 block font-medium">
          What Docs+AI should call you
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="response" className="mb-2 block font-medium">
          How do you want Docs+AI to response
        </label>
        <input
          type="text"
          id="response"
          value={responseStyle}
          onChange={(e) => setResponseStyle(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2"
          placeholder="E.g., Formal, Casual, Technical, etc."
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="newChat"
            checked={enableNewChat}
            onChange={(e) => setEnableNewChat(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="newChat" className="ml-2 block text-sm">
            Enable for new chat
          </label>
        </div>
      </div>

      <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
        Update preferences
      </button>
    </div>
  )
}
