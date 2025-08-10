import { useState, useEffect, useCallback, useRef } from "react";
import { Navbar } from "../../components/layout/Navbar";
import { SearchBox } from "../../components/Search-box";
import { SearchResults } from "../../components/Search-results";
import { SearchFilter } from "../../components/Search-filter";
import { semanticSearchDocuments, getDocumentTypes } from "../../lib/api/document";
import { getTags } from "../../lib/api/tag";
import type { SearchFilterValue, DocumentTypeItem } from "../../components/Search-filter";

import { Card, Spin, Typography, Row, Col } from "antd";
import { RobotOutlined, SearchOutlined, FilterOutlined, FileTextOutlined } from "@ant-design/icons";
// Import test utilities for development/testing
import { testSemanticSearchParams, testDefaultFilterValues } from "../../utils/searchTestUtils";

const { Title, Paragraph } = Typography;

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [filter, setFilter] = useState<SearchFilterValue>({
    documentTags: [],
    startDate: null,
    endDate: null,
    // Enhanced filter parameters with default values
    minRelevance: 0.3,
    maxResults: 20,
    enableHybridScoring: true,
    boostDepartmentResults: true,
    latestVersionsOnly: true,
    scope: 0,
    documentTypeId: '',
    signedBy: '',
    fromDate: null,
    toDate: null,
  });
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeItem[]>([]);

  // Fetch reference data on mount
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch tags
        const tagList = await getTags(1, 100);
        setTags(tagList.items);

        // Fetch document types
        const docTypes = await getDocumentTypes();
        setDocumentTypes(docTypes.map(type => ({
          id: type.id,
          name: type.name,
          description: type.description
        })));

        // Run tests in development mode
        if (import.meta.env.DEV) {
          console.log('🧪 Running Enhanced Semantic Search Tests...');
          testSemanticSearchParams();
          testDefaultFilterValues();
        }
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };

    fetchReferenceData();
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
        pageSize: filter.maxResults,
        // Enhanced filter parameters
        minRelevance: filter.minRelevance,
        maxResults: filter.maxResults,
        enableHybridScoring: filter.enableHybridScoring,
        boostDepartmentResults: filter.boostDepartmentResults,
        latestVersionsOnly: filter.latestVersionsOnly,
        scope: filter.scope,
        documentTypeId: filter.documentTypeId || undefined,
        signedBy: filter.signedBy || undefined,
      };

      // Date parameters
      if (filter.startDate) {
        params.EffectiveFrom = filter.startDate.toISOString();
      }
      if (filter.endDate) {
        params.EffectiveUntil = filter.endDate.toISOString();
      }
      if (filter.fromDate) {
        params.fromDate = filter.fromDate.toISOString();
      }
      if (filter.toDate) {
        params.toDate = filter.toDate.toISOString();
      }

      console.log('Enhanced search params:', params);
      const res = await semanticSearchDocuments(params);
      setSearchResults(res?.data?.items || []);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
          </div>

          {/* Main Content */}
          <Row gutter={[24, 24]}>
            {/* Filters Sidebar */}
            <Col xs={24} lg={6}>
              <div className="sticky top-6">
                <SearchFilter
                  value={filter}
                  onChange={setFilter}
                  tags={tags}
                  documentTypes={documentTypes}
                />
              </div>
            </Col>

            {/* Search and Results */}
            <Col xs={24} lg={18}>
              <div className="space-y-6">
                {/* Search Box Section */}
                <Card
                  className="border border-blue-100"
                  styles={{ body: { padding: '24px' } }}
                >
                  <div className="flex items-center mb-4">
                    <SearchOutlined className="text-blue-600 text-xl mr-3" />
                    <Title level={4} className="mb-0 text-gray-800">
                      Search Query
                    </Title>
                  </div>
                  <SearchBox
                    onSearch={handleSearch}
                    placeholder="Describe what you're looking for using natural language..."
                  />
                </Card>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                      <Spin size="large" />
                    </div>

                )}

                {/* Results Section */}
                {isSearched && !loading && (
                  <div>
                    {searchResults.length > 0 && (
                      <div className="flex items-center mb-6">
                        <FileTextOutlined className="text-blue-600 mr-2" />
                        <span className="text-lg font-medium text-gray-800">Search Results</span>
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {searchResults.length} found
                        </span>
                      </div>
                    )}
                    <SearchResults results={searchResults} />
                  </div>
                )}

                {/* Welcome State */}
                {!isSearched && !loading && (
                  <Card className="shadow-md border border-blue-100">
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <SearchOutlined style={{ fontSize: '48px', color: '#3b82f6' }} />
                      </div>
                      <Title level={3} className="text-gray-700 mb-2">
                        Ready to Search
                      </Title>
                      <Paragraph className="text-gray-500 text-lg mb-4">
                        Enter your search query above and use the filters to find relevant documents
                      </Paragraph>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <RobotOutlined className="text-blue-600 text-2xl mb-2" />
                          <div className="font-medium text-gray-800">AI-Powered</div>
                          <div className="text-sm text-gray-600">Semantic search understands context</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <FilterOutlined className="text-purple-600 text-2xl mb-2" />
                          <div className="font-medium text-gray-800">Advanced Filters</div>
                          <div className="text-sm text-gray-600">Refine results with multiple criteria</div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <FileTextOutlined className="text-green-600 text-2xl mb-2" />
                          <div className="font-medium text-gray-800">Comprehensive</div>
                          <div className="text-sm text-gray-600">Search across all document types</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </main>
    </div>
  );
}
