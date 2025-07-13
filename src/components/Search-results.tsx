import { User, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface SearchResultsProps {
  results: any[];
}

export function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="p-6 text-center bg-white border border-gray-200 rounded-md">
        <p className="text-gray-500">
          No results found. Try a different search query or filters.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-medium">Result</h2>
      <div className="space-y-4">
        {results.map((result) => (
          <Link
            key={result.id}
            to={`/document/${result.id}`}
            className="block p-6 transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md"
          >
            <h3 className="mb-3 text-xl font-medium">{result.title}</h3>
            <div className="flex flex-wrap gap-6 mb-3 text-sm text-gray-500">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {result.author}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {result.createdDate}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {result.updatedDate}
              </div>
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {result.type}
              </div>
            </div>
            <p className="mb-3 text-gray-700">{result.description}</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                {result.category}
              </span>
              <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                {result.quarter}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
