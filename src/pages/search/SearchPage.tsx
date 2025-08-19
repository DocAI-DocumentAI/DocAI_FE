import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "../../components/layout/Navbar";
import { SearchBox } from "../../components/Search-box";
import { SearchResults } from "../../components/Search-results";
import { SearchFilter } from "../../components/Search-filter";
import {
  enhancedSemanticSearchDocuments,
  getDocumentTypes,
} from "../../lib/api/document";
import { getTags } from "../../lib/api/tag";
import type {
  SearchFilterValue,
  DocumentTypeItem,
} from "../../components/Search-filter";

import { Card, Spin, Typography, Row, Col, Alert } from "antd";
import {
  RobotOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  BulbOutlined,
} from "@ant-design/icons";
// Import test utilities for development/testing
import {
  testSemanticSearchParams,
  testDefaultFilterValues,
} from "../../utils/searchTestUtils";

const { Title, Paragraph } = Typography;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [aiAnswer, setAiAnswer] = useState<string>("");
  const [hasAnswer, setHasAnswer] = useState<boolean>(false);
  const [isSearched, setIsSearched] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
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
    documentTypeId: "",
    signedBy: "",
    fromDate: null,
    toDate: null,
    // New folder filtering parameters
    folderId: null,
    includeSubfolders: false,
  });
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeItem[]>([]);

  // Restore state from URL parameters on mount
  const isRestoringFromURL = useRef(false);
  const hasSearchedInitialQuery = useRef(false);

  useEffect(() => {
    const query = searchParams.get("q");
    const tags = searchParams.get("tags");
    const documentTypeId = searchParams.get("docType");
    const signedBy = searchParams.get("signedBy");

    if (query || tags || documentTypeId || signedBy) {
      isRestoringFromURL.current = true;
    }

    if (query) {
      setInitialQuery(query);
      setIsSearched(true);
      // Set loading immediately when we have a query from URL
      setLoading(true);
    }

    if (tags || documentTypeId || signedBy) {
      setFilter((prev) => ({
        ...prev,
        documentTags: tags ? tags.split(",") : prev.documentTags,
        documentTypeId: documentTypeId || prev.documentTypeId,
        signedBy: signedBy || prev.signedBy,
      }));
    }

    // Reset flags after a short delay
    setTimeout(() => {
      isRestoringFromURL.current = false;
    }, 500);

    // Reset search flag when URL changes
    hasSearchedInitialQuery.current = false;
  }, [searchParams]);

  // Fetch reference data on mount
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch tags
        const tagList = await getTags(1, 100);
        setTags(tagList.items);

        // Fetch document types
        const docTypes = await getDocumentTypes();
        setDocumentTypes(
          docTypes.map((type) => ({
            id: type.id,
            name: type.name,
            description: type.description,
          }))
        );

        // Run tests in development mode
        if (import.meta.env.DEV) {
          console.log("🧪 Running Enhanced Semantic Search Tests...");
          testSemanticSearchParams();
          testDefaultFilterValues();
        }
      } catch (error) {
        console.error("Error fetching reference data:", error);
      }
    };

    fetchReferenceData();
  }, []);

  // Keep track of last query for auto-search
  const lastQueryRef = useRef("");
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return;
      lastQueryRef.current = query;
      setIsSearched(true);
      setLoading(true);

      // Clear previous AI answer
      setAiAnswer("");
      setHasAnswer(false);

      // Update URL parameters
      const newSearchParams = new URLSearchParams();
      newSearchParams.set("q", query);
      if (filter.documentTags.length > 0) {
        newSearchParams.set("tags", filter.documentTags.join(","));
      }
      if (filter.documentTypeId) {
        newSearchParams.set("docType", filter.documentTypeId);
      }
      if (filter.signedBy) {
        newSearchParams.set("signedBy", filter.signedBy);
      }
      setSearchParams(newSearchParams);
      try {
        const params = {
          query: query,
          minRelevance: filter.minRelevance,
          maxResults: filter.maxResults,
          enableHybridScoring: filter.enableHybridScoring,
          scope: filter.scope.toString(), // Convert to string as expected by API
          documentTypeId: filter.documentTypeId || null,
          departmentId: null, // Can be added later if needed
          fromDate: filter.fromDate ? filter.fromDate.toISOString() : null,
          toDate: filter.toDate ? filter.toDate.toISOString() : null,
          effectiveFrom: filter.startDate ? filter.startDate.toISOString() : null,
          effectiveUntil: filter.endDate ? filter.endDate.toISOString() : null,
          folderId: filter.folderId,
          includeSubfolders: filter.includeSubfolders,
        };

        console.log("Enhanced search params:", params);
        const res = await enhancedSemanticSearchDocuments(params);

        // Update to handle the new response structure
        if (res.data && res.data.success) {
          setSearchResults(res.data.relevantDocuments || []);
          setAiAnswer(res.data.answer || "");
          setHasAnswer(res.data.hasAnswer || false);
        } else {
          setSearchResults([]);
          setAiAnswer("");
          setHasAnswer(false);
        }
      } catch (e) {
        console.error("Search error:", e);
        setSearchResults([]);
        setAiAnswer("");
        setHasAnswer(false);
      } finally {
        setLoading(false);
      }
    },
    [filter, setSearchParams]
  );

  // Auto-search when initialQuery is set and reference data is loaded
  useEffect(() => {
    if (
      initialQuery &&
      tags.length > 0 &&
      documentTypes.length > 0 &&
      !hasSearchedInitialQuery.current
    ) {
      hasSearchedInitialQuery.current = true;
      handleSearch(initialQuery);
    }
  }, [initialQuery, tags.length, documentTypes.length, handleSearch]);

  // Auto-search when filters change (but not when restoring from URL)
  useEffect(() => {
    if (isSearched && lastQueryRef.current && !isRestoringFromURL.current) {
      // Set loading state before search
      setLoading(true);
      handleSearch(lastQueryRef.current);
    }
  }, [
    filter.startDate,
    filter.endDate,
    filter.documentTags,
    filter.documentTypeId,
    filter.signedBy,
    filter.folderId,
    filter.includeSubfolders,
    filter.minRelevance,
    filter.maxResults,
    filter.enableHybridScoring,
    filter.scope,
    isSearched,
    handleSearch,
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-8"></div>

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
                  styles={{ body: { padding: "24px" } }}
                >
                  <div className="flex items-center mb-4">
                    <SearchOutlined className="mr-3 text-xl text-blue-600" />
                    <Title level={4} className="mb-0 text-gray-800">
                      Search
                    </Title>
                  </div>
                  <SearchBox
                    onSearch={handleSearch}
                    placeholder="Describe what you're looking for using natural language..."
                    initialValue={initialQuery}
                  />
                </Card>

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Spin size="large" />
                  </div>
                )}

                {/* AI Answer Section */}
                {isSearched && !loading && hasAnswer && aiAnswer && (
                  <Card className="border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <BulbOutlined className="text-2xl text-blue-600 mt-1" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <Title level={5} className="mb-0 text-blue-800">
                            AI Generated Answer
                          </Title>
                          <span className="px-2 py-1 ml-2 text-xs text-blue-700 bg-blue-200 rounded-full">
                            AI
                          </span>
                        </div>
                        <div className="text-gray-700 leading-relaxed">
                          {aiAnswer}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Results Section */}
                {isSearched && !loading && (
                  <div>
                    {searchResults.length > 0 && (
                      <div className="flex items-center mb-6">
                        <FileTextOutlined className="mr-2 text-blue-600" />
                        <span className="text-lg font-medium text-gray-800">
                          {hasAnswer && aiAnswer ? "Source Documents" : "Search Results"}
                        </span>
                        <span className="px-2 py-1 ml-2 text-sm text-blue-800 bg-blue-100 rounded-full">
                          {searchResults.length} found
                        </span>
                      </div>
                    )}
                    <SearchResults results={searchResults} />
                  </div>
                )}

                {/* Welcome State */}
                {!isSearched && !loading && (
                  <Card className="border border-blue-100 shadow-md">
                    <div className="py-12 text-center">
                      <div className="mb-4">
                        <SearchOutlined
                          style={{ fontSize: "48px", color: "#3b82f6" }}
                        />
                      </div>
                      <Title level={3} className="mb-2 text-gray-700">
                        Ready to Search
                      </Title>
                      <Paragraph className="mb-4 text-lg text-gray-500">
                        Enter your search query above and use the filters to
                        find relevant documents
                      </Paragraph>
                      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
                        <div className="p-4 rounded-lg bg-blue-50">
                          <RobotOutlined className="mb-2 text-2xl text-blue-600" />
                          <div className="font-medium text-gray-800">
                            AI-Powered
                          </div>
                          <div className="text-sm text-gray-600">
                            Semantic search understands context
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-purple-50">
                          <FilterOutlined className="mb-2 text-2xl text-purple-600" />
                          <div className="font-medium text-gray-800">
                            Advanced Filters
                          </div>
                          <div className="text-sm text-gray-600">
                            Refine results with multiple criteria
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-green-50">
                          <FileTextOutlined className="mb-2 text-2xl text-green-600" />
                          <div className="font-medium text-gray-800">
                            Comprehensive
                          </div>
                          <div className="text-sm text-gray-600">
                            Search across all document types
                          </div>
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
