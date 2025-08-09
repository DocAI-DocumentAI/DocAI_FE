import React from 'react';
import { Link } from "react-router-dom";
import { Card, Tag, Typography, Space, Divider, Empty } from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  TagsOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface SearchResultsProps {
  results: any[];
}

export function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <Text type="secondary" className="text-lg">No results found</Text>
            <br />
            <Text type="secondary">Try adjusting your search query or filters</Text>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result, index) => (
        <div
          key={result.id}
          className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all duration-200"
        >
          <Link
            to={`/document/${result.id}`}
            className="block"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Title level={4} className="mb-2 text-gray-800 hover:text-blue-600 transition-colors">
                  <FileTextOutlined className="mr-2 text-blue-500" />
                  {result.title}
                </Title>
                {result.description && (
                  <Paragraph
                    className="text-gray-600 mb-3"
                    ellipsis={{ rows: 2, expandable: false }}
                  >
                    {result.description}
                  </Paragraph>
                )}
              </div>
              <div className="ml-4 flex items-center text-blue-600 hover:text-blue-800">
                <EyeOutlined className="mr-1" />
                <Text className="text-sm">View</Text>
              </div>
            </div>

            <Divider className="my-3" />

            {/* Document Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <Space direction="vertical" size="small">
                <div className="flex items-center text-sm text-gray-600">
                  <FileTextOutlined className="mr-2 text-gray-400" />
                  <Text strong>Document:</Text>
                  <Text className="ml-1">{result.documentName}</Text>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TeamOutlined className="mr-2 text-gray-400" />
                  <Text strong>Department:</Text>
                  <Text className="ml-1">{result.departmentName}</Text>
                </div>
              </Space>

              <Space direction="vertical" size="small">
                <div className="flex items-center text-sm text-gray-600">
                  <UserOutlined className="mr-2 text-gray-400" />
                  <Text strong>Created by:</Text>
                  <Text className="ml-1">{result.createdByName}</Text>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarOutlined className="mr-2 text-gray-400" />
                  <Text strong>Created:</Text>
                  <Text className="ml-1">
                    {result.createdTime && new Date(result.createdTime).toLocaleDateString()}
                  </Text>
                </div>
              </Space>
            </div>

            {/* Status and Tags */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag
                  color={result.status === 'Active' ? 'green' : result.status === 'Draft' ? 'orange' : 'default'}
                  className="font-medium"
                >
                  {result.status}
                </Tag>
                {result.relevanceScore && (
                  <Tag color="blue" className="font-medium">
                    {Math.round(result.relevanceScore * 100)}% match
                  </Tag>
                )}
              </div>

              {Array.isArray(result.tags) && result.tags.length > 0 && (
                <div className="flex items-center">
                  <TagsOutlined className="mr-2 text-gray-400" />
                  <Space size={[0, 4]} wrap>
                    {result.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                      <Tag key={tagIndex} className="text-xs">
                        {tag}
                      </Tag>
                    ))}
                    {result.tags.length > 3 && (
                      <Tag className="text-xs">
                        +{result.tags.length - 3} more
                      </Tag>
                    )}
                  </Space>
                </div>
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
