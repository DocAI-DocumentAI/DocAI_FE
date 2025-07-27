import { useState, useEffect, useCallback, useRef } from "react";
import { Navbar } from "../../components/layout/Navbar";
import { SearchBox } from "../../components/Search-box";
import { SearchResults } from "../../components/Search-results";
import { SearchFilter } from "../../components/Search-filter";
import { semanticSearchDocuments } from "../../lib/api/document";
import { getTags } from "../../lib/api/tag";
import type { SearchFilterValue } from "../../components/Search-filter"; 

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [filter, setFilter] = useState<SearchFilterValue>({
    documentTags: [],
    startDate: null,
    endDate: null,
  });
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<any[]>([]);

  // Fetch tags on mount
  useEffect(() => {
    (async () => {
      const tagList = await getTags(1, 50);
      setTags(tagList);
    })();
  }, []);

  // Auto-search when startDate or endDate changes
  useEffect(() => {
    if (filter.startDate || filter.endDate) {
      // Use last query if available, or skip if no query
      if (lastQueryRef.current) {
        handleSearch(lastQueryRef.current);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.startDate, filter.endDate]);

  // Keep track of last query for auto-search
  const lastQueryRef = useRef("");
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    lastQueryRef.current = query;
    setIsSearched(true);
    setLoading(true);
    try {
      let userId = "";
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user.userId || user.id || "";
        }
      } catch {}
      const params: any = {
        Query: query,
        Tags: filter.documentTags,
        userId,
        pageNumber: 1,
        pageSize: 10,
      };
      if (filter.startDate  ) {
        params.EffectiveFrom = filter.startDate.toISOString();
      }
      if (filter.endDate ) {
        params.EffectiveUntil = filter.endDate.toISOString();
      }
      console.log('Selected startDate:', filter.startDate ? filter.startDate.toISOString() : null);
      console.log('Selected endDate:', filter.endDate ? filter.endDate.toISOString() : null);
      console.log('Search params:', params);
      const res = await semanticSearchDocuments(params);
      setSearchResults(res?.data?.items || []);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="mb-1 text-2xl font-bold">AI Documents search</h1>
            <p className="text-sm text-gray-600">
              Using prompt, filter and find related document
            </p>
          </div>

          <div className="flex gap-4">
            <SearchFilter value={filter} onChange={setFilter} tags={tags} />

            <div className="flex-1">
              <div className="mb-4">
                <SearchBox onSearch={handleSearch} />
              </div>

              {loading && <div>Đang tìm kiếm...</div>}
              {isSearched && !loading && <SearchResults results={searchResults} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
