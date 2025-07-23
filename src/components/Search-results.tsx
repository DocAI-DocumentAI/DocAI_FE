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
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <h3 className="mb-2 text-xl font-medium">{result.title}</h3>
            <div className="mb-2 text-gray-700">{result.description}</div>
            <div className="mb-2 text-sm text-gray-500 flex flex-wrap gap-4">
              <span><b>Document Name:</b> {result.documentName}</span>
              <span><b>Department:</b> {result.departmentName}</span>
              <span><b>Status:</b> {result.status}</span>
            </div>
            <div className="mb-2 text-sm text-gray-500 flex flex-wrap gap-4">
              <span><b>Created By:</b> {result.createdByName}</span>
              <span><b>Created Time:</b> {result.createdTime && new Date(result.createdTime).toLocaleString()}</span>
            </div>
            <div className="mb-2 text-sm text-gray-500 flex flex-wrap gap-4">
              <span><b>Tags:</b> {Array.isArray(result.tags) ? result.tags.join(', ') : ''}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
