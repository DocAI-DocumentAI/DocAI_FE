"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, User, Calendar, FileText, Eye, Download, Bookmark } from "lucide-react"
import { useParams } from "react-router-dom"
import { Navbar } from "../../components/layout/Navbar"
import { Link } from "react-router-dom"
import { api } from "../../lib/api/api";
import toast from "react-hot-toast"

export default function DocumentPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<
    "preview" | "information" | "summary" | "original" | "version" | "content"
  >("preview")
  const [versions, setVersions] = useState<any[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [canPreview, setCanPreview] = useState(false);

  // Get current user ID (you might need to get this from auth context or localStorage)

  const userStr = localStorage.getItem("user");
  if (!userStr) {
    toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
    return;
  }
  const user = JSON.parse(userStr);

  const checkBookmarkStatus = async () => {
    try {
      const response = await api.get(`/document/bookmarks?userId=${user.userId}&pageNumber=1&pageSize=100`);
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
      console.error('Failed to check bookmark status:', error);
    }
  };

  const toggleBookmark = async () => {
    try {
      if (isBookmarked && bookmarkId) {
        // Remove bookmark
        await api.delete(`/document/bookmarks/${id}?userId=${user.userId}`);
        setIsBookmarked(false);
        setBookmarkId(null);
        toast.success("Đã xóa bookmark");
      } else {
        // Add bookmark
        await api.post(`/document/bookmarks/${id}?userId=${user.userId}`);
        setIsBookmarked(true);
        toast.success("Đã thêm bookmark");
        // Refresh bookmark status to get the new bookmark ID
        await checkBookmarkStatus();
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      toast.error('Lỗi khi thay đổi bookmark');
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
      console.error('Preview failed:', error);
      setCanPreview(false);
      toast.error(`Preview failed: ${error?.response?.data?.message || error.message}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const downloadFile = async (versionId: string) => {
    try {
      const response = await api.get(`/document/files/${versionId}/download`, {
        responseType: 'blob'
      });

      // Check if we're on the client side
      if (typeof window === 'undefined') return;
      console.log('Download response:', response);

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Try to get filename from response headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';

      if (contentDisposition) {
        // Handle both filename and filename* formats
        const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?(?:"?)([^";]+)(?:"?)/);
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      } else {
        // If no content-disposition, use mainDoc filename or create one based on content-type
        if (mainDoc.fileName) {
          filename = mainDoc.fileName;
        } else {
          // Determine extension from content-type
          const contentType = response.headers['content-type'];
          let extension = '';
          if (contentType) {
            if (contentType.includes('pdf')) extension = '.pdf';
            else if (contentType.includes('wordprocessingml')) extension = '.docx';
            else if (contentType.includes('spreadsheetml')) extension = '.xlsx';
            else if (contentType.includes('presentationml')) extension = '.pptx';
            else if (contentType.includes('msword')) extension = '.doc';
            else if (contentType.includes('excel')) extension = '.xls';
            else if (contentType.includes('powerpoint')) extension = '.ppt';
          }
          filename = `${mainDoc.title || 'document'}${extension}`;
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("File downloaded successfully");
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Tải file thất bại');
    }
  };

  useEffect(() => {
    if (!id) return;
    api.get(`/document/documents/${id}/versions`).then(res => {
      setVersions(res.data.data || []);
    });
    checkBookmarkStatus();
  }, [id]);

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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <Link to="/search" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to search
            </Link>
            <div className="flex gap-2">
              <button
                className={`rounded-md border p-2 ${isBookmarked ? 'border-blue-800 bg-blue-50' : 'border-gray-300'}`}
                onClick={toggleBookmark}
                title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'text-blue-800 fill-blue-800' : 'text-gray-700'}`} />
              </button>
              <button
                className="flex items-center rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                onClick={handlePreviewClick}
                disabled={!mainDoc.versionId}
                title="Preview document"
              >
                <Eye className="mr-1 h-4 w-4" />
                Preview
              </button>
              <button
                className="flex items-center rounded-md bg-blue-800 px-4 py-2 text-sm text-white hover:bg-blue-900"
                onClick={() => mainDoc.versionId && downloadFile(mainDoc.versionId)}
                disabled={!mainDoc.versionId}
                title="Download document"
              >
                <Download className="mr-1 h-4 w-4" />
                Download
              </button>
            </div>
          </div>

          <h1 className="mb-4 text-2xl font-bold">{mainDoc.title || 'Chưa có'}</h1>

          <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <User className="mr-1 h-4 w-4" />
              {mainDoc.author || mainDoc.createdByName || 'Chưa có'}
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {mainDoc.createdTime ? new Date(mainDoc.createdTime).toLocaleString() : 'Chưa có'}
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {mainDoc.lastUpdatedTime ? new Date(mainDoc.lastUpdatedTime).toLocaleString() : 'Chưa có'}
            </div>
            <div className="flex items-center">
              <FileText className="mr-1 h-4 w-4" />
              {mainDoc.fileType || 'Chưa có'}
            </div>
            <div className="flex items-center">
              <Eye className="mr-1 h-4 w-4" />
              {mainDoc.views || 'Chưa có'}
            </div>
            <div className="flex items-center">
              <Download className="mr-1 h-4 w-4" />
              {mainDoc.downloads || 'Chưa có'}
            </div>
          </div>

          <div className="mb-6 border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${activeTab === "preview" ? "border-b-2 border-blue-800 text-blue-800" : "text-gray-600 hover:text-gray-900"}`}
                onClick={handlePreviewClick}
              >
                <Eye className="mr-1 h-4 w-4 inline" />
                Preview
              </button>
              <button
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${activeTab === "content" ? "border-b-2 border-blue-800 text-blue-800" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveTab("content")}
              >Content</button>
              <button
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${activeTab === "information" ? "border-b-2 border-blue-800 text-blue-800" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveTab("information")}
              >Information</button>
              <button
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${activeTab === "summary" ? "border-b-2 border-blue-800 text-blue-800" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveTab("summary")}
              >Summary</button>

              <button
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${activeTab === "original" ? "border-b-2 border-blue-800 text-blue-800" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveTab("original")}
              >Original Document</button>
              <button
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${activeTab === "version" ? "border-b-2 border-blue-800 text-blue-800" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveTab("version")}
              >Version</button>
            </div>
          </div>

          {activeTab === "content" && (
            <div>
              <div
                className="prose max-w-none rounded-md border border-gray-200 bg-white p-6"
                dangerouslySetInnerHTML={{ __html: mainDoc.content || mainDoc.description || 'Chưa có' }}
              />
            </div>
          )}

          {activeTab === "information" && (
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-medium">Document information</h2>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Author:</div>
                  <div className="text-sm">{mainDoc.author || mainDoc.createdByName || 'Chưa có'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Size:</div>
                  <div className="text-sm">{mainDoc.fileSize || 'Chưa có'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Downloads:</div>
                  <div className="text-sm">{mainDoc.downloads || 'Chưa có'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Views:</div>
                  <div className="text-sm">{mainDoc.views || 'Chưa có'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Type of document:</div>
                  <div className="text-sm">{mainDoc.fileType || 'Chưa có'}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "summary" && (
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-medium">Summary</h2>
              <div className="mb-2 text-sm">
                Author: {mainDoc.author || mainDoc.createdByName || 'Chưa có'}<br />
                Size: {mainDoc.fileSize || 'Chưa có'}<br />
                Version: {mainDoc.versionName || mainDoc.versionId || 'Chưa có'}<br />
                Expiration Date: {mainDoc.effectiveUntil ? new Date(mainDoc.effectiveUntil).toLocaleDateString() : 'Chưa có'}<br />
                Publish Date: {mainDoc.createdTime ? new Date(mainDoc.createdTime).toLocaleDateString() : 'Chưa có'}<br />
                Status: {mainDoc.status || 'Chưa có'}<br />
                Document Type: {mainDoc.fileType || 'Chưa có'}<br />
                Department: {mainDoc.departmentId || 'Chưa có'}<br />
                Tag: {Array.isArray(mainDoc.tags) && mainDoc.tags.length > 0 ? mainDoc.tags.join(', ') : 'Chưa có'}<br />
                Signed By: {mainDoc.signedBy || 'Chưa có'}<br />
              </div>
              <div className="text-sm" dangerouslySetInnerHTML={{ __html: `<b>Summary:</b> ${mainDoc.summary || 'Chưa có'}` }} />
            </div>
          )}

          {activeTab === "preview" && (
            <div className="rounded-md border border-gray-200 bg-white">
              {previewLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <div className="text-sm text-gray-600">Loading preview...</div>
                  </div>
                </div>
              ) : !canPreview ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-lg font-medium text-gray-600 mb-2">Preview not available</div>
                    <div className="text-sm text-gray-500 mb-4">
                      This file type cannot be previewed inline or an error occurred while loading.
                    </div>
                    <button
                      className="flex items-center justify-center mx-auto rounded-md bg-blue-800 px-4 py-2 text-sm text-white hover:bg-blue-900"
                      onClick={() => mainDoc.versionId && downloadFile(mainDoc.versionId)}
                      disabled={!mainDoc.versionId}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Download to view
                    </button>
                  </div>
                </div>
              ) : previewUrl ? (
                <div className="relative">
                  <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        {mainDoc.fileName || 'Document Preview'}
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
                  <div style={{ height: '80vh', minHeight: '600px' }}>
                    <iframe
                      src={previewUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                      title="Document Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-lg font-medium text-gray-600 mb-2">No preview available</div>
                    <div className="text-sm text-gray-500">Unable to load document preview</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "original" && (
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-medium">{mainDoc.title || 'Chưa có'}</h2>
              <div className="mb-2 flex flex-wrap gap-2 text-xs text-gray-500">
                <div className="flex items-center"><User className="mr-1 h-3 w-3" />{mainDoc.author || mainDoc.createdByName || 'Chưa có'}</div>
                <div className="flex items-center"><Calendar className="mr-1 h-3 w-3" />{mainDoc.createdTime ? new Date(mainDoc.createdTime).toLocaleDateString() : 'Chưa có'}</div>
                <div className="flex items-center"><Calendar className="mr-1 h-3 w-3" />{mainDoc.lastUpdatedTime ? new Date(mainDoc.lastUpdatedTime).toLocaleDateString() : 'Chưa có'}</div>
                <div className="flex items-center"><FileText className="mr-1 h-3 w-3" />{mainDoc.fileType || 'Chưa có'}</div>
              </div>
              <div className="mb-2 text-sm">{mainDoc.description || 'Chưa có'}</div>
              <div className="flex gap-2">
                {Array.isArray(mainDoc.tags) && mainDoc.tags.length > 0 ? mainDoc.tags.map((tag: string) => (
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs" key={tag}>{tag}</span>
                )) : <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs">Chưa có</span>}
              </div>
            </div>
          )}

          {activeTab === "version" && (
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <div className="mb-4">
                {versions.length === 0 && <div>No versions found.</div>}
                {versions.map((ver) => (
                  <div className="mb-4 border rounded-md p-4" key={ver.versionId}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium">{ver.versionName || ver.title || 'Chưa có'}</h3>
                      <div className="flex gap-2">
                        <button
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          onClick={() => loadPreview(ver.versionId)}
                          disabled={previewLoading}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Preview
                        </button>
                        <button
                          className="text-xs text-green-600 hover:text-green-800 flex items-center"
                          onClick={() => downloadFile(ver.versionId)}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="mb-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
                      <div><b>Title:</b> {ver.title || 'Chưa có'}</div>
                      <div><b>Description:</b> <span dangerouslySetInnerHTML={{ __html: ver.description || 'Chưa có' }} /></div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <b>Summary:</b> <span
                          className="block overflow-hidden text-ellipsis"
                          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: '2.8em' }}
                          dangerouslySetInnerHTML={{ __html: ver.summary || 'Chưa có' }}
                        />
                      </div>
                      <div><b>File Name:</b> {ver.fileName || 'Chưa có'}</div>
                      <div><b>File Path:</b> {ver.filePath || 'Chưa có'}</div>
                      <div><b>File Size:</b> {ver.fileSize || 'Chưa có'}</div>
                      <div><b>File Type:</b> {ver.fileType || 'Chưa có'}</div>
                      <div><b>Status:</b> {ver.status || 'Chưa có'}</div>
                      <div><b>Created Time:</b> {ver.createdTime ? new Date(ver.createdTime).toLocaleString() : 'Chưa có'}</div>
                      <div><b>Last Submitted:</b> {ver.lastSubmitted ? new Date(ver.lastSubmitted).toLocaleString() : 'Chưa có'}</div>
                      <div><b>Submitted By:</b> {ver.submittedBy || 'Chưa có'}</div>
                      <div><b>Is Replaced:</b> {ver.isReplaced !== undefined ? (ver.isReplaced ? 'Có' : 'Không') : 'Chưa có'}</div>
                    </div>
                    <div className="mb-2 text-xs text-gray-700">
                      <b>Tags:</b> {Array.isArray(ver.tags) && ver.tags.length > 0 ? ver.tags.join(', ') : 'Chưa có'}
                    </div>
                    {ver.replacementDocument && (
                      <div className="mb-2 text-xs text-gray-700">
                        <b>Replacement Document:</b> {ver.replacementDocument.title || 'Chưa có'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
