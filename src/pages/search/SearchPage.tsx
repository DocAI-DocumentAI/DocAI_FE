import { useState } from "react";
import { Navbar } from "../../components/layout/navbar";
import { SearchBox } from "../../components/Search-box";
import { SearchResults } from "../../components/Search-results";
import { SearchFilter } from "../../components/Search-filter";

export default function SearchPage() {
  // Remove the unused searchQuery state variable since it's set but never used
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearched, setIsSearched] = useState(false);

  // Mock search function
  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    // We're not using searchQuery anywhere, so we can remove setSearchQuery(query)
    setIsSearched(true);

    // Mock data for search results
    const mockResults = [
      {
        id: "1",
        title: "Báo cáo tài chính Q4 2023",
        author: "Nguyễn Văn B",
        createdDate: "10/11/2023",
        updatedDate: "15/11/2023",
        type: "Reports",
        description:
          "Báo cáo tổng quan về tình hình tài chính của công ty trong quý 1 năm 2023, bao gồm doanh thu, chi phí và lợi nhuận.",
        category: "Tài chính",
        quarter: "Q4",
      },
      {
        id: "2",
        title: "Báo cáo tài chính Q4 2023",
        author: "Nguyễn Văn B",
        createdDate: "10/11/2023",
        updatedDate: "15/11/2023",
        type: "Reports",
        description:
          "Báo cáo tổng quan về tình hình tài chính của công ty trong quý 1 năm 2023, bao gồm doanh thu, chi phí và lợi nhuận.",
        category: "Tài chính",
        quarter: "Q4",
      },
      {
        id: "3",
        title: "Báo cáo tài chính Q4 2023",
        author: "Nguyễn Văn B",
        createdDate: "10/11/2023",
        updatedDate: "15/11/2023",
        type: "Reports",
        description:
          "Báo cáo tổng quan về tình hình tài chính của công ty trong quý 1 năm 2023, bao gồm doanh thu, chi phí và lợi nhuận.",
        category: "Tài chính",
        quarter: "Q4",
      },
    ];

    setSearchResults(mockResults);
  };

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
            <SearchFilter />

            <div className="flex-1">
              <div className="mb-4">
                <SearchBox onSearch={handleSearch} />
              </div>

              {isSearched && <SearchResults results={searchResults} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
