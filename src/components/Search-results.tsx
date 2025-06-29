 
import { User, Calendar, FileText } from "lucide-react"
import { Link } from "react-router-dom"

interface SearchResultsProps {
  results: any[]
}

export function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-center">
        <p className="text-gray-500">No results found. Try a different search query or filters.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-medium">Result</h2>
      <div className="space-y-4">
        {results.map((result) => (
          <Link
            key={result.id}
            to={`/document/${result.id}`}
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="mb-3 text-xl font-medium">{result.title}</h3>
            <div className="mb-3 flex flex-wrap gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                {result.author}
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {result.createdDate}
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {result.updatedDate}
              </div>
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                {result.type}
              </div>
            </div>
            <p className="mb-3 text-gray-700">{result.description}</p>
            <div className="flex gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">{result.category}</span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">{result.quarter}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
