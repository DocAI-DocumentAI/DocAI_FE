"use client"

import { useState, useEffect } from "react"
import { Trash2, Eye, Calendar, User, FileText, Bookmark } from "lucide-react"
import { Link } from "react-router-dom"
import { Navbar } from "../../components/layout/Navbar"
import { api } from "../../lib/api/api"
import toast from "react-hot-toast"

interface BookmarkItem {
  id: string
  documentId: string
  title: string
  description: string
  ownerId: string
  createdTime: string
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10

  const userStr = localStorage.getItem("user");
  if (!userStr) {
    toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
    return;
  }
  const user = JSON.parse(userStr);

  const fetchBookmarks = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await api.get(`/document/bookmarks?userId=${user.userId}&pageNumber=${page}&pageSize=${pageSize}`)
      const data = response.data.data
      setBookmarks(data.items || [])
      setTotalPages(data.totalPages || 1)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteBookmark = async (documentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bookmark này?')) return
    
    try {
      await api.delete(`/document/bookmarks/${documentId}?userId=${user.userId}`)
      // Refresh the list
      fetchBookmarks(currentPage)
    } catch (error) {
      console.error('Failed to delete bookmark:', error)
      alert('Lỗi khi xóa bookmark')
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
              <p className="text-gray-600">Quản lý các tài liệu đã bookmark</p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Bookmark className="mr-1 h-4 w-4" />
              {bookmarks.length} tài liệu
            </div>
          </div>

          {bookmarks.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <Bookmark className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">Chưa có bookmark nào</h3>
              <p className="text-gray-500">Bắt đầu bookmark các tài liệu để dễ dàng truy cập sau này.</p>
              <Link
                to="/search"
                className="mt-4 inline-flex items-center rounded-md bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
              >
                Tìm kiếm tài liệu
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-medium text-gray-900">
                        {bookmark.title || 'Untitled Document'}
                      </h3>
                      <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                        {bookmark.description || 'Không có mô tả'}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          Đã bookmark: {new Date(bookmark.createdTime).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          ID: {bookmark.ownerId.slice(0, 8)}...
                        </div>
                        <div className="flex items-center">
                          <FileText className="mr-1 h-3 w-3" />
                          Document ID: {bookmark.documentId.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <Link
                        to={`/document/${bookmark.documentId}`}
                        className="flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Xem
                      </Link>
                      <button
                        onClick={() => deleteBookmark(bookmark.documentId)}
                        className="flex items-center rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => fetchBookmarks(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <span className="text-sm text-gray-500">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => fetchBookmarks(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
