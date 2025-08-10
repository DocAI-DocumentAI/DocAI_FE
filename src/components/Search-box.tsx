"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Search } from "lucide-react"

interface SearchBoxProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBox({ onSearch, placeholder = "Prompt to search" }: SearchBoxProps) {
  const [query, setQuery] = useState("")
  const searchBoxRef = useRef<HTMLTextAreaElement>(null)

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="relative h-[140px] rounded-lg border-2 border-blue-200 bg-white shadow-sm hover:border-blue-300 transition-colors">
      <textarea
        ref={searchBoxRef}
        className="absolute w-full resize-none rounded-lg border-0 px-4 py-4 pr-24 outline-none text-gray-800 placeholder-gray-500"
        placeholder={placeholder}
        rows={3}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          minHeight: "56px",
          maxHeight: "130px",
          overflow: "auto",
          lineHeight: "1.6",
          fontSize: "16px",
        }}
      />
      <button
        onClick={handleSearch}
        disabled={!query.trim()}
        className="absolute bottom-4 right-4 flex items-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <Search className="mr-2 h-4 w-4" />
        Search
      </button>
      {query.trim() && (
        <div className="absolute top-2 right-2 text-xs text-gray-400">
          Press Enter to search
        </div>
      )}
    </div>
  )
}
