import React from "react";
import {
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Typography,
  Divider,
} from "antd";
import {
  ClearOutlined,
  SearchOutlined,
  FileTextOutlined,
  TagsOutlined,
  CalendarOutlined,
  FolderOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import type {
  DocumentTypeResponse,
  TagResponse,
} from "../types/DocumentLibrary";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface DocumentLibraryFilterProps {
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
  documentTypes?: DocumentTypeResponse[];
  tags?: TagResponse[];
  loading?: boolean;
}

export const DocumentLibraryFilter: React.FC<DocumentLibraryFilterProps> = ({
  onFilterChange,
  onClearFilters,
  documentTypes = [],
  tags = [],
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({ [key]: value });
  };

  return (
    <div className="p-4">
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {/* Title Search */}
        <div>
          <div className="flex items-center mb-2">
            <FileTextOutlined
              style={{ color: "#1e40af", marginRight: "6px" }}
            />
            <Text type="secondary" className="text-sm font-medium">
              Document Title
            </Text>
          </div>
          <Input
            prefix={<SearchOutlined style={{ color: "#6b7280" }} />}
            placeholder="Search by title..."
            onChange={(e) => handleFilterChange("title", e.target.value)}
            allowClear
            className="border-blue-200 focus:border-blue-500"
          />
        </div>

        {/* Keyword Search */}
        <div>
          <div className="flex items-center mb-2">
            <SearchOutlined style={{ color: "#1e40af", marginRight: "6px" }} />
            <Text type="secondary" className="text-sm font-medium">
              Keywords
            </Text>
          </div>
          <Input
            prefix={<SearchOutlined style={{ color: "#6b7280" }} />}
            placeholder="Search by keywords..."
            onChange={(e) => handleFilterChange("keyword", e.target.value)}
            allowClear
            className="border-blue-200 focus:border-blue-500"
          />
        </div>

        <Divider className="my-3" />

        {/* Document Type */}
        <div>
          <div className="flex items-center mb-2">
            <FolderOutlined style={{ color: "#1e40af", marginRight: "6px" }} />
            <Text type="secondary" className="text-sm font-medium">
              Document Type
            </Text>
          </div>
          <Select
            placeholder="Select document type..."
            onChange={(value) => handleFilterChange("documentTypeId", value)}
            allowClear
            style={{ width: "100%" }}
            className="[&_.ant-select-selector]:border-blue-200 [&_.ant-select-focused_.ant-select-selector]:border-blue-500"
          >
            <Select.Option key="all" value="">
              <div className="flex items-center">
                <FolderOutlined
                  style={{ color: "#1e40af", marginRight: "8px" }}
                />
                <span className="font-medium">All Document Types</span>
              </div>
            </Select.Option>
            {documentTypes.map((type) => (
              <Select.Option key={type.id} value={type.id}>
                <div className="flex items-center">
                  <FolderOutlined
                    style={{ color: "#1e40af", marginRight: "8px" }}
                  />
                  {type.name}
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center mb-2">
            <TagsOutlined style={{ color: "#1e40af", marginRight: "6px" }} />
            <Text type="secondary" className="text-sm font-medium">
              Tags
            </Text>
          </div>
          <Select
            mode="multiple"
            placeholder="Select tags..."
            onChange={(value) => handleFilterChange("selectedTags", value)}
            allowClear
            style={{ width: "100%" }}
            className="[&_.ant-select-selector]:border-blue-200 [&_.ant-select-focused_.ant-select-selector]:border-blue-500"
          >
            {tags.map((tag) => (
              <Select.Option key={tag.id} value={tag.id}>
                <div className="flex items-center">
                  <TagsOutlined
                    style={{ color: "#1e40af", marginRight: "8px" }}
                  />
                  {tag.name}
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>

        <Divider className="my-3" />

        {/* Date Range */}
        <div>
          <div className="flex items-center mb-2">
            <CalendarOutlined
              style={{ color: "#1e40af", marginRight: "6px" }}
            />
            <Text type="secondary" className="text-sm font-medium">
              Date Range
            </Text>
          </div>
          <RangePicker
            style={{ width: "100%" }}
            className="[&_.ant-picker]:border-blue-200 [&_.ant-picker-focused]:border-blue-500"
            onChange={(dates) => {
              if (dates) {
                handleFilterChange("fromDate", dates[0]?.format("YYYY-MM-DD"));
                handleFilterChange("toDate", dates[1]?.format("YYYY-MM-DD"));
              } else {
                handleFilterChange("fromDate", "");
                handleFilterChange("toDate", "");
              }
            }}
          />
        </div>

        {/* Author */}
        <div>
          <div className="flex items-center mb-2">
            <UserOutlined style={{ color: "#1e40af", marginRight: "6px" }} />
            <Text type="secondary" className="text-sm font-medium">
              Author
            </Text>
          </div>
          <Input
            prefix={<UserOutlined style={{ color: "#6b7280" }} />}
            placeholder="Search by author..."
            onChange={(e) => handleFilterChange("submittedBy", e.target.value)}
            allowClear
            className="border-blue-200 focus:border-blue-500"
          />
        </div>

        <Divider className="my-3" />

        {/* Access Level */}
        <div>
          <div className="flex items-center mb-2">
            <LockOutlined style={{ color: "#1e40af", marginRight: "6px" }} />
            <Text type="secondary" className="text-sm font-medium">
              Access Level
            </Text>
          </div>
          <Select
            placeholder="Select access level..."
            onChange={(value) => handleFilterChange("isPublic", value)}
            allowClear
            style={{ width: "100%" }}
            className="[&_.ant-select-selector]:border-blue-200 [&_.ant-select-focused_.ant-select-selector]:border-blue-500"
          >
            <Select.Option key="all" value="">
              <div className="flex items-center">
                <LockOutlined
                  style={{ color: "#1e40af", marginRight: "8px" }}
                />
                <span className="font-medium">All Documents</span>
              </div>
            </Select.Option>
            <Select.Option key="public" value={true}>
              <div className="flex items-center">
                <UnlockOutlined
                  style={{ color: "#10b981", marginRight: "8px" }}
                />
                <span className="text-green-600 font-medium">Public Only</span>
              </div>
            </Select.Option>
            <Select.Option key="private" value={false}>
              <div className="flex items-center">
                <LockOutlined
                  style={{ color: "#ef4444", marginRight: "8px" }}
                />
                <span className="text-red-600 font-medium">Private Only</span>
              </div>
            </Select.Option>
          </Select>
        </div>

        {/* Clear All Button */}
        <div className="pt-4 border-t border-gray-100">
          <Button
            type="text"
            size="small"
            icon={<ClearOutlined />}
            onClick={onClearFilters}
            className="text-blue-800 hover:text-blue-600 w-full"
            block
          >
            Clear All Filters
          </Button>
        </div>
      </Space>
    </div>
  );
};
