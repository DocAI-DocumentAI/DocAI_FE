import {
  DatePicker,
  Card,
  Input,
  Select,
  Slider,
  Switch,
  Button,
  Space,
  Typography,
  Divider,
  InputNumber
} from "antd";
import {
  FilterOutlined,
  ClearOutlined,
  TagsOutlined,
  CalendarOutlined,
  FolderOutlined,
  UserOutlined,
  SettingOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

export interface SearchFilterValue {
  documentTags: string[];
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  // Enhanced filter parameters
  minRelevance: number;
  maxResults: number;
  enableHybridScoring: boolean;
  boostDepartmentResults: boolean;
  latestVersionsOnly: boolean;
  scope: number; // 0: All documents, 1: Public documents only, 2: Department documents only
  documentTypeId: string;
  signedBy: string;
  fromDate: Dayjs | null;
  toDate: Dayjs | null;
}

export interface TagItem {
  id: string;
  name: string;
}

export interface DocumentTypeItem {
  id: string;
  name: string;
  description?: string;
}

interface SearchFilterProps {
  value: SearchFilterValue;
  onChange: (value: SearchFilterValue) => void;
  tags: TagItem[];
  documentTypes: DocumentTypeItem[];
}

export function SearchFilter({ value, onChange, tags, documentTypes }: SearchFilterProps) {
  const handleFilterChange = (key: string, filterValue: any) => {
    onChange({ ...value, [key]: filterValue });
  };

  const handleClearFilters = () => {
    onChange({
      documentTags: [],
      startDate: null,
      endDate: null,
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
  };

  const scopeOptions = [
    { value: 0, label: 'All documents' },
    { value: 1, label: 'Public documents only' },
    { value: 2, label: 'Department documents only' },
  ];

  return (
    <Card
      title={
        <div className="flex items-center">
          <FilterOutlined className="mr-2 text-blue-800" />
          <Text strong>Advanced Filters</Text>
        </div>
      }
      extra={
        <Button
          type="text"
          size="small"
          icon={<ClearOutlined />}
          onClick={handleClearFilters}
          className="text-blue-800 hover:text-blue-600"
        >
          Clear All
        </Button>
      }
      className="shadow-sm border border-blue-100"
      styles={{ body: { padding: '16px' } }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Search Quality Settings */}
        <div>
          <div className="flex items-center mb-2">
            <SettingOutlined style={{ color: '#1e40af', marginRight: '6px' }} />
            <Text type="secondary" className="text-sm font-medium">Search Quality</Text>
          </div>

          <div className="mb-3">
            <Text className="text-xs text-gray-600 mb-1 block">Minimum Relevance: {value.minRelevance}</Text>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={value.minRelevance}
              onChange={(val) => handleFilterChange('minRelevance', val)}
              className="mb-2"
            />
          </div>

          <div className="mb-3">
            <Text className="text-xs text-gray-600 mb-1 block">Maximum Results</Text>
            <InputNumber
              min={1}
              max={100}
              value={value.maxResults}
              onChange={(val) => handleFilterChange('maxResults', val || 20)}
              style={{ width: '100%' }}
              className="border-blue-200 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Text className="text-xs text-gray-600">Enable Hybrid Scoring</Text>
              <Switch
                checked={value.enableHybridScoring}
                onChange={(checked) => handleFilterChange('enableHybridScoring', checked)}
                size="small"
              />
            </div>
            <div className="flex items-center justify-between">
              <Text className="text-xs text-gray-600">Boost Department Results</Text>
              <Switch
                checked={value.boostDepartmentResults}
                onChange={(checked) => handleFilterChange('boostDepartmentResults', checked)}
                size="small"
              />
            </div>
            <div className="flex items-center justify-between">
              <Text className="text-xs text-gray-600">Latest Versions Only</Text>
              <Switch
                checked={value.latestVersionsOnly}
                onChange={(checked) => handleFilterChange('latestVersionsOnly', checked)}
                size="small"
              />
            </div>
          </div>
        </div>

        <Divider className="my-3" />

        {/* Document Scope */}
        <div>
          <div className="flex items-center mb-2">
            <GlobalOutlined style={{ color: '#1e40af', marginRight: '6px' }} />
            <Text type="secondary" className="text-sm font-medium">Document Scope</Text>
          </div>
          <Select
            value={value.scope}
            onChange={(val) => handleFilterChange('scope', val)}
            options={scopeOptions}
            style={{ width: '100%' }}
            className="[&_.ant-select-selector]:border-blue-200 [&_.ant-select-focused_.ant-select-selector]:border-blue-500"
          />
        </div>

        {/* Document Type */}
        <div>
          <div className="flex items-center mb-2">
            <FolderOutlined style={{ color: '#1e40af', marginRight: '6px' }} />
            <Text type="secondary" className="text-sm font-medium">Document Type</Text>
          </div>
          <Select
            placeholder="Select document type..."
            value={value.documentTypeId || undefined}
            onChange={(val) => handleFilterChange('documentTypeId', val || '')}
            allowClear
            style={{ width: '100%' }}
            className="[&_.ant-select-selector]:border-blue-200 [&_.ant-select-focused_.ant-select-selector]:border-blue-500"
          >
            {documentTypes.map(type => (
              <Select.Option key={type.id} value={type.id}>
                <div className="flex items-center">
                  <FolderOutlined style={{ color: '#1e40af', marginRight: '8px' }} />
                  {type.name}
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center mb-2">
            <TagsOutlined style={{ color: '#1e40af', marginRight: '6px' }} />
            <Text type="secondary" className="text-sm font-medium">Tags</Text>
          </div>
          <Select
            mode="multiple"
            placeholder="Select tags..."
            value={value.documentTags}
            onChange={(val) => handleFilterChange('documentTags', val)}
            allowClear
            style={{ width: '100%' }}
            className="[&_.ant-select-selector]:border-blue-200 [&_.ant-select-focused_.ant-select-selector]:border-blue-500"
          >
            {tags.map(tag => (
              <Select.Option key={tag.id} value={tag.name}>
                <div className="flex items-center">
                  <TagsOutlined style={{ color: '#1e40af', marginRight: '8px' }} />
                  {tag.name}
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>

        <Divider className="my-3" />

        {/* Signed By */}
        <div>
          <div className="flex items-center mb-2">
            <UserOutlined style={{ color: '#1e40af', marginRight: '6px' }} />
            <Text type="secondary" className="text-sm font-medium">Signed By</Text>
          </div>
          <Input
            prefix={<UserOutlined style={{ color: '#6b7280' }} />}
            placeholder="Enter signer name..."
            value={value.signedBy}
            onChange={(e) => handleFilterChange('signedBy', e.target.value)}
            allowClear
            className="border-blue-200 focus:border-blue-500"
          />
        </div>

        {/* Date Ranges */}
        <div>
          <div className="flex items-center mb-2">
            <CalendarOutlined style={{ color: '#1e40af', marginRight: '6px' }} />
            <Text type="secondary" className="text-sm font-medium">Date Filters</Text>
          </div>

          <div className="space-y-3">
            <div>
              <Text className="text-xs text-gray-600 mb-1 block">Effective Date Range</Text>
              <RangePicker
                value={[value.startDate, value.endDate]}
                onChange={(dates) => {
                  handleFilterChange('startDate', dates?.[0] || null);
                  handleFilterChange('endDate', dates?.[1] || null);
                }}
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
                className="border-blue-200 focus:border-blue-500"
              />
            </div>

            <div>
              <Text className="text-xs text-gray-600 mb-1 block">Document Date Range</Text>
              <RangePicker
                value={[value.fromDate, value.toDate]}
                onChange={(dates) => {
                  handleFilterChange('fromDate', dates?.[0] || null);
                  handleFilterChange('toDate', dates?.[1] || null);
                }}
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
                className="border-blue-200 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </Space>
    </Card>
  );
}
