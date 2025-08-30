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
  // Handle multiple tags selection
  const handleTagsChange = (selectedTags: string[]) => {
    const filterParams = {
      tags: selectedTags, // API expects tags parameter (lowercase)
      pageNumber: 1,
      pageSize: 10
    };
    
    onFilterChange(filterParams);
  };

  // Handle document type change
  const handleDocumentTypeChange = (documentTypeId: string) => {
    const filterParams = {
      documentTypeId: documentTypeId, // API expects documentTypeId (lowercase)
      pageNumber: 1,
      pageSize: 10
    };
    
    onFilterChange(filterParams);
  };

  // Handle date range change
  const handleDateRangeChange = (dates: any) => {
    const filterParams: any = {
      pageNumber: 1,
      pageSize: 10
    };
    
    if (dates && dates.length === 2) {
      // Convert to ISO datetime format (start of day and end of day)
      filterParams.fromDate = dates[0]?.startOf('day').toISOString();
      filterParams.toDate = dates[1]?.endOf('day').toISOString();
    } else {
      filterParams.fromDate = undefined;
      filterParams.toDate = undefined;
    }
    
    onFilterChange(filterParams);
  };

  // Handle effective date range change
  const handleEffectiveDateRangeChange = (dates: any) => {
    const filterParams: any = {
      pageNumber: 1,
      pageSize: 10
    };
    
    if (dates && dates.length === 2) {
      // Convert to ISO datetime format (start of day and end of day)
      filterParams.effectiveFrom = dates[0]?.startOf('day').toISOString();
      filterParams.effectiveUntil = dates[1]?.endOf('day').toISOString();
    } else {
      filterParams.effectiveFrom = undefined;
      filterParams.effectiveUntil = undefined;
    }
    
    onFilterChange(filterParams);
  };

  // Handle signed by change (changed from submitted by)
  const handleSignedByChange = (value: string) => {
    const filterParams = {
      signedBy: value, // API expects signedBy (lowercase)
      pageNumber: 1,
      pageSize: 10
    };
    
    onFilterChange(filterParams);
  };

  // Handle access level change
  const handleAccessLevelChange = (value: boolean | undefined) => {
    const filterParams = {
      isPublic: value, // API expects isPublic (lowercase)
      pageNumber: 1,
      pageSize: 10
    };
    
    onFilterChange(filterParams);
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }} size="small">
        {/* Document Type */}
        <div>
          <div className="flex items-center mb-1">
            <FolderOutlined style={{ color: "#1e40af", marginRight: "8px", fontSize: "14px" }} />
            <Text type="secondary" className="text-sm font-medium">
              Document Type
            </Text>
          </div>
          <Select
            placeholder="Select document type..."
            onChange={handleDocumentTypeChange}
            allowClear
            style={{ width: "100%", height: "36px" }}
            className="[&_.ant-select-selector]:border-blue-200 [&_.ant-select-focused_.ant-select-selector]:border-blue-500 [&_.ant-select-selector]:h-[36px] [&_.ant-select-selector]:flex [&_.ant-select-selector]:items-center"
          >
            <Select.Option key="all" value="">
              <div className="flex items-center py-1">
                <FolderOutlined
                  style={{ color: "#1e40af", marginRight: "10px" }}
                />
                <span className="font-medium">All Document Types</span>
              </div>
            </Select.Option>
            {documentTypes.map((type) => (
              <Select.Option key={type.id} value={type.id}>
                <div className="flex items-center py-1">
                  <FolderOutlined
                    style={{ color: "#1e40af", marginRight: "10px" }}
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
            <TagsOutlined style={{ color: "#1e40af", marginRight: "8px", fontSize: "14px" }} />
            <Text type="secondary" className="text-sm font-medium">
              Tags
            </Text>
          </div>
          <Select
            mode="multiple"
            placeholder="Select tags..."
            onChange={handleTagsChange}
            allowClear
            style={{ width: "100%" }}
            className="[&_.ant-select-selector]:border-blue-200 [&_.ant-select-focused_.ant-select-selector]:border-blue-500"
            maxTagCount={20}
            showArrow={true}
          >
            {tags.map((tag) => (
              <Select.Option key={tag.id} value={tag.name}>
                <div className="flex items-center">
                  <TagsOutlined
                    style={{ color: "#1e40af", marginRight: "10px" }}
                  />
                  {tag.name}
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>

        <Divider className="my-2" />

        {/* Creation Date Range */}
        <div>
          <div className="flex items-center mb-1">
            <CalendarOutlined
              style={{ color: "#1e40af", marginRight: "8px", fontSize: "14px" }}
            />
            <Text type="secondary" className="text-sm font-medium">
              Creation Date Range
            </Text>
          </div>
          <RangePicker
            style={{ width: "100%", height: "36px" }}
            className="[&_.ant-picker]:border-blue-200 [&_.ant-picker-focused]:border-blue-500 [&_.ant-picker]:h-[36px] [&_.ant-picker]:flex [&_.ant-picker]:items-center"
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
            placeholder={["From Date", "To Date"]}
            showTime={false}
          />
        </div>

        {/* Effective Date Range */}
        <div>
          <div className="flex items-center mb-1">
            <CalendarOutlined
              style={{ color: "#10b981", marginRight: "8px", fontSize: "14px" }}
            />
            <Text type="secondary" className="text-sm font-medium">
              Effective Date Range
            </Text>
          </div>
          <RangePicker
            style={{ width: "100%", height: "36px" }}
            className="[&_.ant-picker]:border-green-200 [&_.ant-picker-focused]:border-green-500 [&_.ant-picker]:h-[36px] [&_.ant-picker]:flex [&_.ant-picker]:items-center"
            onChange={handleEffectiveDateRangeChange}
            format="YYYY-MM-DD"
            placeholder={["Effective From", "Effective Until"]}
            showTime={false}
          />
        </div>

        {/* Signed By */}
        <div>
          <div className="flex items-center mb-1">
            <UserOutlined style={{ color: "#1e40af", marginRight: "8px", fontSize: "14px" }} />
            <Text type="secondary" className="text-sm font-medium">
              Signed By
            </Text>
          </div>
          <Input
            // prefix={<UserOutlined style={{ color: "#6b7280" }} />}
            placeholder="Search by signer name..."
            onChange={(e) => handleSignedByChange(e.target.value)}
            allowClear
            style={{ height: "36px" }}
            className="border-blue-200 focus:border-blue-500"
          />
        </div>

        <Divider className="my-2" />

        {/* Access Level */}
        <div>
          <div className="flex items-center mb-1">
            <LockOutlined style={{ color: "#1e40af", marginRight: "8px", fontSize: "14px" }} />
            <Text type="secondary" className="text-sm font-medium">
              Access Level
            </Text>
          </div>
          <Select
            placeholder="Select access level..."
            onChange={handleAccessLevelChange}
            allowClear
            style={{ width: "100%", height: "36px" }}
            className="[&_.ant-select-selector]:border-blue-200 [&_.ant-select-focused_.ant-select-selector]:border-blue-500 [&_.ant-select-selector]:h-[36px] [&_.ant-select-selector]:flex [&_.ant-select-selector]:items-center"
          >
            <Select.Option key="all" value={undefined}>
              <div className="flex items-center py-1">
                <LockOutlined
                  style={{ color: "#1e40af", marginRight: "10px" }}
                />
                <span className="font-medium">All Documents</span>
              </div>
            </Select.Option>
            <Select.Option key="public" value={true}>
              <div className="flex items-center py-1">
                <UnlockOutlined
                  style={{ color: "#10b981", marginRight: "10px" }}
                />
                <span className="text-green-600 font-medium">Public Only</span>
              </div>
            </Select.Option>
            <Select.Option key="private" value={false}>
              <div className="flex items-center py-1">
                <LockOutlined
                  style={{ color: "#ef4444", marginRight: "10px" }}
                />
                <span className="text-red-600 font-medium">Private Only</span>
              </div>
            </Select.Option>
          </Select>
        </div>

        {/* Clear All Button */}
        <div className="pt-4 border-t border-gray-100">
          <Button
            type="primary"
            size="small"
            icon={<ClearOutlined />}
            onClick={onClearFilters}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 w-full min-h-[36px]"
            block
          >
            Clear All Filters
          </Button>
        </div>
      </Space>
    </div>
  );
};
