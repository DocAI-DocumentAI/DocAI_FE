 
import { useState } from "react"

export default function AppearanceSettings() {
  const [language, setLanguage] = useState("English")
  const [theme, setTheme] = useState("Light")

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Appearance</h1>

      <div className="mb-6">
        <label htmlFor="language" className="mb-2 block font-medium">
          Language
        </label>
        <input
          type="text"
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="theme" className="mb-2 block font-medium">
          Theme
        </label>
        <select
          id="theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="Light">Light</option>
          <option value="Dark">Dark</option>
          <option value="System">System</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">Choose how DocsAI looks to you.</p>
      </div>

      <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
        Update appearance
      </button>
    </div>
  )
}
