"use client"

import { Layout, Typography, Card, Button, Input, Select, DatePicker, Upload, Form, Row, Col, Space } from "antd"
import { ArrowLeftOutlined, UploadOutlined, InboxOutlined } from "@ant-design/icons"
 
const { Title, Text } = Typography
const { Content } = Layout
const { TextArea } = Input
const { Dragger } = Upload
 

export default function UploadDocument({ onViewChange }: any) {
  const [form] = Form.useForm()

  const handleSubmit = (values: any) => {
    console.log("Form values:", values)
    // Handle form submission
    onViewChange("queue")
  }

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".pdf,.docx",
    beforeUpload: () => false, // Prevent auto upload
    onChange(info: any) {
      console.log("File info:", info)
    },
  }

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Content style={{ padding: "14px" }}>
        <div style={{   margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => onViewChange("queue")}
              style={{ marginBottom: 16 }}
            >
              Back to Document List
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Upload New Document
            </Title>
            <Text type="secondary">Upload a document with AI-powered analysis</Text>
          </div>

          <Card>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              {/* Document Upload Section */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                  <UploadOutlined style={{ marginRight: 8 }} />
                  <Title level={4} style={{ margin: 0 }}>
                    Document Upload
                  </Title>
                </div>
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                  Upload a PDF or DOCX file. Our AI will automatically extract metadata to help you.
                </Text>

                <Form.Item
                  name="file"
                  label="Document File"
                  rules={[{ required: true, message: "Please upload a document file" }]}
                >
                  <Dragger {...uploadProps} style={{ padding: "40px 20px" }}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                    </p>
                    <p style={{ fontSize: 16, marginBottom: 8 }}>Drag and drop your file here, or click to browse</p>
                    <Button type="default">Choose File</Button>
                    <p style={{ color: "#999", fontSize: 12, marginTop: 8 }}>Supported formats: PDF, DOCX (max 5MB)</p>
                  </Dragger>
                </Form.Item>
              </div>

              {/* Document Details */}
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="title"
                    label="Document Title"
                    rules={[{ required: true, message: "Please enter document title" }]}
                  >
                    <Input placeholder="Enter document title" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="documentNumber"
                    label="Official Document Number"
                    rules={[{ required: true, message: "Please enter document number" }]}
                  >
                    <Input placeholder="e.g. IVA/2025/HD-CP" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="type"
                    label="Document Type"
                    rules={[{ required: true, message: "Please select document type" }]}
                  >
                    <Select placeholder="Select document type">
                      <Select.Option value="guidelines">Guidelines</Select.Option>
                      <Select.Option value="policy">Policy</Select.Option>
                      <Select.Option value="procedure">Procedure</Select.Option>
                      <Select.Option value="template">Template</Select.Option>
                      <Select.Option value="manual">Manual</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="department"
                    label="Department"
                    rules={[{ required: true, message: "Please select department" }]}
                  >
                    <Select placeholder="Select department">
                      <Select.Option value="engineering">Engineering</Select.Option>
                      <Select.Option value="design">Design</Select.Option>
                      <Select.Option value="product">Product</Select.Option>
                      <Select.Option value="marketing">Marketing</Select.Option>
                      <Select.Option value="hr">Human Resources</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="effectiveFrom" label="Effective From">
                    <DatePicker style={{ width: "100%" }} placeholder="mm/dd/yyyy" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="effectiveTo" label="Effective To">
                    <DatePicker style={{ width: "100%" }} placeholder="mm/dd/yyyy" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Brief description of the document" />
              </Form.Item>

              <Form.Item name="summary" label="Summary">
                <TextArea rows={4} placeholder="Document summary (can be auto-generated by AI)" />
              </Form.Item>

              <Form.Item name="tags" label="Tags">
                <Input placeholder="Enter tags separated by commas" />
              </Form.Item>

              <Form.Item name="signedBy" label="Signed By">
                <Input placeholder="Name of the person who signed the document" />
              </Form.Item>

              {/* Action Buttons */}
              <Form.Item style={{ marginTop: 32 }}>
                <Space>
                  <Button onClick={() => onViewChange("queue")}>Cancel</Button>
                  <Button type="primary" htmlType="submit" icon={<UploadOutlined />}>
                    Next: Analyze Document
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  )
}
