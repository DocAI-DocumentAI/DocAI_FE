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
    <div className="relative h-[130px] rounded-lg border border-gray-200 bg-white">
      <textarea
        ref={searchBoxRef}
        className="absolute w-full resize-none rounded-l-lg border-0 px-4 py-3 outline-none"
        placeholder={placeholder}
        rows={2}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          minHeight: "48px",
          maxHeight: "120px",
          overflow: "auto",
          lineHeight: "1.5",
        }}
      />
      <button
        onClick={handleSearch}
        className="absolute bottom-3 right-3 m-1 flex items-center rounded-md bg-blue-800 px-4 py-2 text-white hover:bg-blue-900"
      >
        <Search className="mr-2 h-5 w-5" />
        Search
      </button>
    </div>
  )
}
