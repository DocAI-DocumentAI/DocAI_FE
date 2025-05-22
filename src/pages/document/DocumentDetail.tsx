"use client"

import { useState } from "react" 
import { ArrowLeft, User, Calendar, FileText, Eye, Download, Bookmark } from "lucide-react"
import { useParams } from "react-router-dom"
import { Navbar } from "../../components/layout/navbar"
import { Link } from "react-router-dom"

export default function DocumentPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<"content" | "information">("content")

  // Mock document data
  const document = {
    id,
    title: "Báo cáo tài chính Q1 2023",
    author: "Nguyễn Văn B",
    createdDate: "10/11/2023",
    updatedDate: "15/11/2023",
    type: "Reports",
    views: 285,
    downloads: 12,
    size: "12MB",
    content: `
      <h2>Báo cáo tài chính Quý 1 năm 2023</h2>
      
      <h3>Tổng quan</h3>
      <p>Quý 1 năm 2023 đánh dấu một khởi đầu tích cực cho công ty với doanh thu tăng 15% so với cùng kỳ năm ngoái. Lợi nhuận tăng đạt 2.5 tỷ đồng, vượt 10% so với kế hoạch đề ra.</p>
      
      <h3>Doanh thu</h3>
      <ul>
        <li>Tổng doanh thu: 15.7 tỷ đồng</li>
        <li>Tăng trưởng: 15% so với Q1 2022</li>
        <li>Phân bố theo sản phẩm:
          <ul>
            <li>Sản phẩm A: 7.2 tỷ đồng (46%)</li>
            <li>Sản phẩm B: 5.3 tỷ đồng (34%)</li>
            <li>Sản phẩm C: 3.2 tỷ đồng (20%)</li>
          </ul>
        </li>
      </ul>
      
      <h3>Chi phí</h3>
      <ul>
        <li>Tổng chi phí: 12.1 tỷ đồng</li>
        <li>Chi phí vận hành: 8.3 tỷ đồng</li>
        <li>Chi phí marketing: 2.1 tỷ đồng</li>
        <li>Chi phí hành chính: 1.7 tỷ đồng</li>
      </ul>
      
      <h3>Lợi nhuận</h3>
      <ul>
        <li>Lợi nhuận gộp: 3.6 tỷ đồng</li>
        <li>Lợi nhuận ròng: 2.5 tỷ đồng</li>
        <li>Biên lợi nhuận: 16%</li>
      </ul>
      
      <h3>Dự báo</h3>
      <p>Dựa trên kết quả Q1, chúng tôi dự báo doanh thu cả năm 2023 sẽ đạt 68-70 tỷ đồng, tăng 18% so với năm 2022.</p>
      
      <h3>Kết luận</h3>
      <p>Kết quả tài chính Q1 2023 cho thấy công ty đang đi đúng hướng để đạt được mục tiêu tăng trưởng đề ra cho năm 2023. Các chính sách mở rộng thị trường và tối ưu hóa chi phí đang phát huy hiệu quả.</p>
    `,
    relatedDocuments: [
      {
        id: "4",
        title: "Báo cáo tài chính Q4 2023",
        author: "Nguyễn Văn B",
        createdDate: "10/11/2023",
        updatedDate: "15/11/2023",
        type: "Reports",
        category: "Tài chính",
        quarter: "Q4",
      },
      {
        id: "5",
        title: "Báo cáo tài chính Q4 2023",
        author: "Nguyễn Văn B",
        createdDate: "10/11/2023",
        updatedDate: "15/11/2023",
        type: "Reports",
        category: "Tài chính",
        quarter: "Q4",
      },
      {
        id: "6",
        title: "Báo cáo tài chính Q4 2023",
        author: "Nguyễn Văn B",
        createdDate: "10/11/2023",
        updatedDate: "15/11/2023",
        type: "Reports",
        category: "Tài chính",
        quarter: "Q4",
      },
    ],
  }

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
              <button className="rounded-md border border-gray-300 p-2">
                <Bookmark className="h-5 w-5 text-gray-700" />
              </button>
              <button className="flex items-center rounded-md bg-blue-800 px-4 py-2 text-sm text-white hover:bg-blue-900">
                <Download className="mr-1 h-4 w-4" />
                Download
              </button>
            </div>
          </div>

          <h1 className="mb-4 text-2xl font-bold">{document.title}</h1>

          <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <User className="mr-1 h-4 w-4" />
              {document.author}
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {document.createdDate}
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {document.updatedDate}
            </div>
            <div className="flex items-center">
              <FileText className="mr-1 h-4 w-4" />
              {document.type}
            </div>
            <div className="flex items-center">
              <Eye className="mr-1 h-4 w-4" />
              {document.views}
            </div>
            <div className="flex items-center">
              <Download className="mr-1 h-4 w-4" />
              {document.downloads}
            </div>
          </div>

          <div className="mb-6 border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "content"
                    ? "border-b-2 border-blue-800 text-blue-800"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("content")}
              >
                Content
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "information"
                    ? "border-b-2 border-blue-800 text-blue-800"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("information")}
              >
                Information
              </button>
            </div>
          </div>

          {activeTab === "content" ? (
            <div>
              <div className="mb-4 rounded-md border border-red-800 bg-red-50 p-2 text-center text-sm font-medium text-red-800">
                PDF Viewer
              </div>
              <div
                className="prose max-w-none rounded-md border border-gray-200 bg-white p-6"
                dangerouslySetInnerHTML={{ __html: document.content }}
              />
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-medium">Document information</h2>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Author:</div>
                  <div className="text-sm">{document.author}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Size:</div>
                  <div className="text-sm">{document.size}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Downloads:</div>
                  <div className="text-sm">{document.downloads}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Views:</div>
                  <div className="text-sm">{document.views}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Type of document:</div>
                  <div className="text-sm">{document.type}</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-4 text-lg font-medium">Related documents</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {document.relatedDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/document/${doc.id}`}
                  className="rounded-md border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <h3 className="mb-2 text-sm font-medium">{doc.title}</h3>
                  <div className="mb-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <User className="mr-1 h-3 w-3" />
                      {doc.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {doc.createdDate}
                    </div>
                    <div className="flex items-center">
                      <FileText className="mr-1 h-3 w-3" />
                      {doc.type}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs">{doc.category}</span>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs">{doc.quarter}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
