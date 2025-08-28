import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  User,
  Calendar,
  FileText,
  Eye,
  Download,
  Bookmark,
  Building,
  Shield,
  CheckCircle,
  Clock,
  Users,
  ThumbsUp,
} from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../../components/layout/Navbar";
import { Link } from "react-router-dom";
import { api } from "../../lib/api/api";
import { getDocumentRecommendations } from "../../lib/api/document";
import toast from "react-hot-toast";
import { DocumentChatBox } from "../../components/DocumentChatBox";

export default function DocumentPage() {
  const { id } = useParams()
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const versionIdFromQuery = urlParams.get('versionId') || undefined
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    | "preview"
    | "information"
    | "content"
    | "original"
    | "version"
    | "recommendations"
  >("preview");
  const [versions, setVersions] = useState<any[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [canPreview, setCanPreview] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Get current user ID (you might need to get this from auth context or localStorage)

  const userStr = localStorage.getItem("user");
  if (!userStr) {

    return;
  }
  const user = JSON.parse(userStr);
  useEffect(() => {
    setActiveTab("preview");
  }, [id]);
  const checkBookmarkStatus = async () => {
    try {
      const response = await api.get(
        `/document/bookmarks?userId=${user.userId}&pageNumber=1&pageSize=100`
      );
      const bookmarks = response.data.data.items || [];
      const bookmark = bookmarks.find((b: any) => b.documentId === id);
      if (bookmark) {
        setIsBookmarked(true);
        setBookmarkId(bookmark.id);
      } else {
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    } catch (error) {
      console.error("Failed to check bookmark status:", error);
    }
  };

  const toggleBookmark = async () => {
    try {
      if (isBookmarked && bookmarkId) {
        // Remove bookmark
        await api.delete(`/document/bookmarks/${id}?userId=${user.userId}`);
        setIsBookmarked(false);
        setBookmarkId(null);
        toast.success("Bookmark removed");
      } else {
        // Add bookmark
        await api.post(`/document/bookmarks/${id}?userId=${user.userId}`);
        setIsBookmarked(true);
        toast.success("Bookmark added");
        // Refresh bookmark status to get the new bookmark ID
        await checkBookmarkStatus();
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      toast.error("Error changing bookmark");
    }
  };

  const loadPreview = async (versionId: string) => {
    if (!versionId) return;

    setPreviewLoading(true);
    try {
      const response = await api.get(`/document/files/${versionId}/iframe-url`);
      const data = response.data.data;

      if (data.canViewInline && data.iframeUrl) {
        setPreviewUrl(data.iframeUrl);
        setCanPreview(true);
      } else {
        setCanPreview(false);
        toast.error("This file type cannot be previewed inline");
      }
    } catch (error: any) {
      console.error("Preview failed:", error);
      setCanPreview(false);
      toast.error(
        `Preview failed: ${error?.response?.data?.message || error.message}`
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const downloadFile = async (versionId: string) => {
    try {
      const response = await api.get(`/document/files/${versionId}/download`, {
        responseType: "blob",
      });

      // Check if we're on the client side
      if (typeof window === "undefined") return;
      console.log("Download response:", response);

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Try to get filename from response headers
      const contentDisposition = response.headers["content-disposition"];
      let filename = "download";

      if (contentDisposition) {
        // Handle both filename and filename* formats
        const filenameMatch = contentDisposition.match(
          /filename\*?=(?:UTF-8'')?(?:"?)([^";]+)(?:"?)/
        );
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      } else {
        // If no content-disposition, use mainDoc filename or create one based on content-type
        if (mainDoc.fileName) {
          filename = mainDoc.fileName;
        } else {
          // Determine extension from content-type
          const contentType = response.headers["content-type"];
          let extension = "";
          if (contentType) {
            if (contentType.includes("pdf")) extension = ".pdf";
            else if (contentType.includes("wordprocessingml"))
              extension = ".docx";
            else if (contentType.includes("spreadsheetml")) extension = ".xlsx";
            else if (contentType.includes("presentationml"))
              extension = ".pptx";
            else if (contentType.includes("msword")) extension = ".doc";
            else if (contentType.includes("excel")) extension = ".xls";
            else if (contentType.includes("powerpoint")) extension = ".ppt";
          }
          filename = `${mainDoc.title || "document"}${extension}`;
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("File download failed");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    if (!id) return;
    api.get(`/document/documents/${id}/versions`).then(res => {
      const list = res.data.data || [];
      // If versionId provided via query, move that version to the front for mainDoc
      if (versionIdFromQuery) {
        const idx = list.findIndex((v: any) => v.versionId === versionIdFromQuery);
        if (idx > 0) {
          const [found] = list.splice(idx, 1);
          list.unshift(found);
        }
      }
      setVersions(list);
    });
    checkBookmarkStatus();
  }, [id, versionIdFromQuery]);

  // Use the first version as the main document for all tabs except Version
  const mainDoc = versions[0] || {};

  // Load preview when mainDoc changes and preview tab is active
  useEffect(() => {
    if (activeTab === "preview" && mainDoc.versionId && !previewUrl) {
      loadPreview(mainDoc.versionId);
    }
  }, [activeTab, mainDoc.versionId]);

  const handlePreviewClick = () => {
    setActiveTab("preview");
    if (mainDoc.versionId && !previewUrl) {
      loadPreview(mainDoc.versionId);
    }
  };

  const fetchRecommendations = useCallback(async () => {
    if (!id) return;

    setLoadingRecommendations(true);
    try {
      const response = await getDocumentRecommendations(id, 10, false);
      console.log("Recommendations API response:", response);

      // The API function now handles response structure normalization
      setRecommendations(response.data || []);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      toast.error("Failed to load recommendations");
      setRecommendations([]); // Ensure it's always an array
    } finally {
      setLoadingRecommendations(false);
    }
  }, [id]);

  // Fetch recommendations when document is loaded
  useEffect(() => {
    if (id && mainDoc.documentId) {
      fetchRecommendations();
    }
  }, [id, mainDoc.documentId, fetchRecommendations]);

  // Handle activeTab from navigation state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            <div className="flex gap-2">
              <button
                className={`rounded-md border p-2 ${isBookmarked
                  ? "border-blue-800 bg-blue-50"
                  : "border-gray-300"
                  }`}
                onClick={toggleBookmark}
                title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <Bookmark
                  className={`h-5 w-5 ${isBookmarked
                    ? "text-blue-800 fill-blue-800"
                    : "text-gray-700"
                    }`}
                />
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                onClick={handlePreviewClick}
                disabled={!mainDoc.versionId}
                title="Preview document"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm text-white bg-blue-800 rounded-md hover:bg-blue-900"
                onClick={() =>
                  mainDoc.versionId && downloadFile(mainDoc.versionId)
                }
                disabled={!mainDoc.versionId}
                title="Download document"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
            </div>
          </div>

          {/* Document Header */}
          <div className="mb-6">
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              {mainDoc.title || "No title"}
            </h1>

            {/* Status and Visibility */}
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  mainDoc.status
                )}`}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {mainDoc.status || "Unknown"}
              </span>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${mainDoc.isPublic
                  ? "bg-green-100 text-green-800"
                  : "bg-orange-100 text-orange-800"
                  }`}
              >
                {mainDoc.isPublic ? (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-1" />
                    Private
                  </>
                )}
              </span>

              {mainDoc.isReplaced && (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
                  <Clock className="w-4 h-4 mr-1" />
                  Replaced
                </span>
              )}
            </div>

            {/* Document Meta Info */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 md:grid-cols-4">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <div className="font-medium">Owner</div>
                  <div>{mainDoc.ownerName || "N/A"}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <div className="font-medium">Department</div>
                  <div>{mainDoc.departmentName || "N/A"}</div>
                </div>
              </div>

              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <div className="font-medium">Type</div>
                  <div>{mainDoc.documentTypeName || "N/A"}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <div className="font-medium">Created</div>
                  <div>
                    {mainDoc.createdTime
                      ? new Date(mainDoc.createdTime).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Effective Dates */}
            {(mainDoc.effectiveFrom ||
              mainDoc.effectiveUntil ||
              mainDoc.signedBy) && (
                <div className="p-4 mt-4 rounded-lg bg-blue-50">
                  <h3 className="mb-2 text-sm font-medium text-blue-900">
                    Document Validity
                  </h3>
                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                    {mainDoc.effectiveFrom && (
                      <div>
                        <span className="font-medium text-blue-800">
                          Effective From:
                        </span>
                        <div className="text-blue-700">
                          {new Date(mainDoc.effectiveFrom).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {mainDoc.effectiveUntil && (
                      <div>
                        <span className="font-medium text-blue-800">
                          Effective Until:
                        </span>
                        <div className="text-blue-700">
                          {new Date(mainDoc.effectiveUntil).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {mainDoc.signedBy && (
                      <div>
                        <span className="font-medium text-blue-800">
                          Signed By:
                        </span>
                        <div className="text-blue-700">{mainDoc.signedBy}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Tags */}
            {Array.isArray(mainDoc.tags) && mainDoc.tags.length > 0 && (
              <div className="mt-4">
                <span className="mr-2 text-sm font-medium text-gray-700">
                  Tags:
                </span>
                <div className="inline-flex flex-wrap gap-2">
                  {mainDoc.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${activeTab === "preview"
                  ? "border-b-2 border-blue-800 text-blue-800"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
                onClick={handlePreviewClick}
              >
                <Eye className="inline w-4 h-4 mr-1" />
                Preview
              </button>
              <button
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${activeTab === "content"
                  ? "border-b-2 border-blue-800 text-blue-800"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
                onClick={() => setActiveTab("content")}
              >
                <FileText className="inline w-4 h-4 mr-1" />
                Content & Summary
              </button>
              <button
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${activeTab === "information"
                  ? "border-b-2 border-blue-800 text-blue-800"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
                onClick={() => setActiveTab("information")}
              >
                <Users className="inline w-4 h-4 mr-1" />
                Information
              </button>
              <button
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${activeTab === "original"
                  ? "border-b-2 border-blue-800 text-blue-800"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
                onClick={() => setActiveTab("original")}
              >
                <FileText className="inline w-4 h-4 mr-1" />
                Original Document
              </button>
              <button
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${activeTab === "version"
                  ? "border-b-2 border-blue-800 text-blue-800"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
                onClick={() => setActiveTab("version")}
              >
                <Clock className="inline w-4 h-4 mr-1" />
                Versions
              </button>
              <button
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${activeTab === "recommendations"
                  ? "border-b-2 border-blue-800 text-blue-800"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
                onClick={() => setActiveTab("recommendations")}
              >
                <ThumbsUp className="inline w-4 h-4 mr-1" />
                Recommendations
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "preview" && (
            <div className="bg-white border border-gray-200 rounded-md">
              {previewLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                    <div className="text-sm text-gray-600">
                      Loading preview...
                    </div>
                  </div>
                </div>
              ) : !canPreview ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <div className="mb-2 text-lg font-medium text-gray-600">
                      Preview not available
                    </div>
                    <div className="mb-4 text-sm text-gray-500">
                      This file type cannot be previewed inline or an error
                      occurred while loading.
                    </div>
                    <button
                      className="flex items-center justify-center px-4 py-2 mx-auto text-sm text-white bg-blue-800 rounded-md hover:bg-blue-900"
                      onClick={() =>
                        mainDoc.versionId && downloadFile(mainDoc.versionId)
                      }
                      disabled={!mainDoc.versionId}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download to view
                    </button>
                  </div>
                </div>
              ) : previewUrl ? (
                <div className="relative">
                  <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div className="flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {mainDoc.fileName || "Document Preview"}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({formatFileSize(mainDoc.fileSize)})
                      </span>
                    </div>
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => loadPreview(mainDoc.versionId)}
                      disabled={previewLoading}
                    >
                      Refresh
                    </button>
                  </div>
                  <div style={{ height: "80vh", minHeight: "600px" }}>
                    <iframe
                      src={previewUrl}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      title="Document Preview"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <div className="mb-2 text-lg font-medium text-gray-600">
                      No preview available
                    </div>
                    <div className="text-sm text-gray-500">
                      Unable to load document preview
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-6">
              {/* Description */}
              {mainDoc.description && (
                <div className="p-6 bg-white border border-gray-200 rounded-md">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Description
                  </h2>
                  <div className="prose text-gray-700 max-w-none">
                    {mainDoc.description}
                  </div>
                </div>
              )}

              {/* Summary */}
              {mainDoc.summary && (
                <div className="p-6 bg-white border border-gray-200 rounded-md">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Summary
                  </h2>
                  <div
                    className="prose text-gray-700 max-w-none"
                    dangerouslySetInnerHTML={{ __html: mainDoc.summary }}
                  />
                </div>
              )}

              {/* If no content available */}
              {!mainDoc.description && !mainDoc.summary && (
                <div className="p-6 bg-white border border-gray-200 rounded-md">
                  <div className="text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No content or summary available for this document.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "information" && (
            <div className="p-6 bg-white border border-gray-200 rounded-md">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Document Information
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="pb-2 font-medium text-gray-800 border-b text-md">
                    Basic Information
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Document ID:
                      </span>
                      <span className="font-mono text-xs text-gray-900">
                        {mainDoc.documentId || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Version ID:
                      </span>
                      <span className="font-mono text-xs text-gray-900">
                        {mainDoc.versionId || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Version Name:
                      </span>
                      <span className="text-gray-900">
                        {mainDoc.versionName || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        File Name:
                      </span>
                      <span className="text-gray-900">
                        {mainDoc.fileName || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        File Type:
                      </span>
                      <span className="text-gray-900">
                        {mainDoc.fileType || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        File Size:
                      </span>
                      <span className="text-gray-900">
                        {mainDoc.fileSize
                          ? formatFileSize(mainDoc.fileSize)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* People & Department */}
                <div className="space-y-4">
                  <h3 className="pb-2 font-medium text-gray-800 border-b text-md">
                    People & Department
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Owner:</span>
                      <span className="text-gray-900">
                        {mainDoc.ownerName || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Department:
                      </span>
                      <span className="text-gray-900">
                        {mainDoc.departmentName || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Document Type:
                      </span>
                      <span className="text-gray-900">
                        {mainDoc.documentTypeName || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Submitted By:
                      </span>
                      <span className="text-gray-900">
                        {mainDoc.submittedByName || "N/A"}
                      </span>
                    </div>
                    {mainDoc.signedBy && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Signed By:
                        </span>
                        <span className="text-gray-900">
                          {mainDoc.signedBy}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <h3 className="pb-2 font-medium text-gray-800 border-b text-md">
                    Important Dates
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Created:
                      </span>
                      <span className="text-gray-900">
                        {mainDoc.createdTime
                          ? new Date(mainDoc.createdTime).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Last Submitted:
                      </span>
                      <span className="text-gray-900">
                        {mainDoc.lastSubmitted
                          ? new Date(mainDoc.lastSubmitted).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                    {mainDoc.effectiveFrom && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Effective From:
                        </span>
                        <span className="text-gray-900">
                          {new Date(mainDoc.effectiveFrom).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {mainDoc.effectiveUntil && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Effective Until:
                        </span>
                        <span className="text-gray-900">
                          {new Date(mainDoc.effectiveUntil).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Properties */}
                <div className="space-y-4">
                  <h3 className="pb-2 font-medium text-gray-800 border-b text-md">
                    Status & Properties
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          mainDoc.status
                        )}`}
                      >
                        {mainDoc.status || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600">
                        Visibility:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${mainDoc.isPublic
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                          }`}
                      >
                        {mainDoc.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600">
                        Is Replaced:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${mainDoc.isReplaced
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                          }`}
                      >
                        {mainDoc.isReplaced ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "original" && (
            <div className="p-6 bg-white border border-gray-200 rounded-md">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Original Document
              </h2>

              {mainDoc.replacementDocument ? (
                <Link to={`/document/${mainDoc.replacementDocument.id}`}>
                  {/* Original Document Title */}
                  <div className="mb-4 text-xl font-bold text-gray-900">
                    {mainDoc.replacementDocument.title || "Untitled Document"}
                  </div>

                  {/* Original Document Meta Info */}
                  <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {mainDoc.replacementDocument.createdByName || "N/A"}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {mainDoc.replacementDocument.createdTime
                        ? new Date(mainDoc.replacementDocument.createdTime).toLocaleDateString('en-US')
                        : "N/A"}
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-3 h-3 mr-1" />
                      {mainDoc.replacementDocument.fileType || "N/A"}
                    </div>
                    <div className="flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      {mainDoc.replacementDocument.departmentName || "N/A"}
                    </div>
                  </div>

                  {/* Original Document Description */}
                  <div className="mb-6 text-sm text-gray-700">
                    {mainDoc.replacementDocument.description || "No description available."}
                  </div>
                </Link>
              ) : (
                /* No Original Document */
                <div className="py-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="mb-2 text-lg font-medium text-gray-600">
                    No Original Document
                  </h3>
                  <p className="text-sm">
                    This document is not a replacement for any existing document.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "version" && (
            <div className="p-6 bg-white border border-gray-200 rounded-md">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Document Versions
              </h2>

              <div className="space-y-4">
                {versions.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No versions found.</p>
                  </div>
                )}

                {versions.map((ver, index) => (
                  <div
                    key={ver.versionId}

                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1 break-words w-3/5">
                          {ver.title ||
                            ver.versionName ||
                            `Version ${index + 1}`}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            ver.status
                          )}`}
                        >
                          {ver.status || "Unknown"}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="flex items-center px-2 py-1 text-xs text-blue-600 border border-blue-200 rounded hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => { navigate(`/document/${id}/version/${ver.versionId}`) }}
                          disabled={previewLoading}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </button>
                        <button
                          className="flex items-center px-2 py-1 text-xs text-green-600 border border-green-200 rounded hover:text-green-800 hover:bg-green-50"
                          onClick={() => downloadFile(ver.versionId)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs text-gray-600 md:grid-cols-4">
                      <div>
                        <span className="font-medium">File:</span>{" "}
                        {ver.fileName || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Size:</span>{" "}
                        {ver.fileSize ? formatFileSize(ver.fileSize) : "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {ver.fileType || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>{" "}
                        {ver.createdTime
                          ? new Date(ver.createdTime).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>

                    {ver.description && (
                      <div className="mb-2 text-xs text-gray-700">
                        <span className="font-medium">Description:</span>{" "}
                        {ver.description}
                      </div>
                    )}

                    {Array.isArray(ver.tags) && ver.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {ver.tags.map((tag: string, tagIndex: number) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="p-6 bg-white border border-gray-200 rounded-md">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Recommended Documents
              </h2>

              {loadingRecommendations ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                    <div className="text-sm text-gray-600">
                      Loading recommendations...
                    </div>
                  </div>
                </div>
              ) : !Array.isArray(recommendations) ||
                recommendations.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <ThumbsUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recommendations found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={rec.documentId || index}
                      className="p-4 transition-colors border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="mb-1 text-sm font-medium text-gray-900">
                            <Link
                              to={`/document/${rec.documentId}`}
                              state={{ activeTab: "preview" }}
                              className="hover:text-blue-600 hover:underline"
                            >
                              {rec.title || "Untitled Document"}
                            </Link>
                          </h3>
                          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Building className="w-3 h-3 mr-1" />
                              {rec.departmentName || "N/A"}
                            </span>
                            <span className="flex items-center">
                              <FileText className="w-3 h-3 mr-1" />
                              {rec.documentTypeName || "N/A"}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {rec.createdTime
                                ? new Date(rec.createdTime).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${rec.isPublic
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                              }`}
                          >
                            {rec.isPublic ? "Public" : "Private"}
                          </span>
                        </div>
                      </div>

                      {rec.description && (
                        <div className="mb-3 text-sm text-gray-700 line-clamp-2">
                          {rec.description}
                        </div>
                      )}

                      {Array.isArray(rec.tags) && rec.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rec.tags
                            .slice(0, 5)
                            .map((tag: string, tagIndex: number) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                          {rec.tags.length > 5 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                              +{rec.tags.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating Document Chat Box */}
      {id && mainDoc?.title && (
        <DocumentChatBox documentId={id} documentTitle={mainDoc.title} />
      )}
    </div>
  );
}
