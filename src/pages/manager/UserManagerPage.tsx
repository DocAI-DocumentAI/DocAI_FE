import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Alert,
  Space,
  Avatar,
  Tag,
  Button,
  Table,
  Input,
  Select,
  DatePicker,
  Badge,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  UserAddOutlined,
  CheckOutlined,
  FallOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  SafetyOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { getUsersApi } from "../../services/userService";
import { usePermissions } from "../../services/permissionService";
import { useRoles } from "../../services/roleService";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import toast from "react-hot-toast";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Filters {
  email: string;
  fullName: string;
  phone: string;
  roleId: string;
  createdFrom: string;
  createdTo: string;
  permissionId: string;
}

const UserManagerPage: React.FC = () => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    churnRate: "0%",
  });
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const [filters, setFilters] = useState<Filters>({
    email: "",
    fullName: "",
    phone: "",
    roleId: "",
    createdFrom: "",
    createdTo: "",
    permissionId: "",
  });

  // Get current user and manager department
  const { user } = useSelector((state: RootState) => state.auth);
  const managerDepartmentId = user?.department?.id;
  const departmentName = user?.department?.name || "Unknown Department";

  // React Query hooks
  const { data: permissions } = usePermissions();
  const { data: roles } = useRoles();

  const calculateStats = async () => {
    if (!managerDepartmentId) return;

    setLoading(true);
    try {
      // Get all users in manager's department
      const allUsersResponse = await getUsersApi({
        departmentId: managerDepartmentId,
        size: 1000, // Get all users
      });

      // Get today's users in manager's department
      const today = new Date().toISOString().split("T")[0];
      const todayUsersResponse = await getUsersApi({
        departmentId: managerDepartmentId,
        createdFrom: today,
        createdTo: today,
        size: 1000,
      });

      // Calculate active vs inactive users (exclude Admin role)
      const allUsers = (allUsersResponse.items || []).filter(
        (user) => user.role.roleName !== "Admin"
      );
      const todayUsers = (todayUsersResponse.items || []).filter(
        (user) => user.role.roleName !== "Admin"
      );
      const activeUsers = allUsers.filter((user) => user.active).length;
      const inactiveUsers = allUsers.filter((user) => !user.active).length;

      // Calculate churn rate (percentage of inactive users)
      const churnRate =
        activeUsers > 0
          ? ((inactiveUsers / (activeUsers + inactiveUsers)) * 100).toFixed(1)
          : "0";

      setUserStats({
        totalUsers: allUsers.length,
        newUsersToday: todayUsers.length,
        activeUsers,
        churnRate: `${churnRate}%`,
      });
    } catch (error: any) {
      toast.error(`Error loading user stats: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!managerDepartmentId) return;

    setUsersLoading(true);
    try {
      const response = await getUsersApi({
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
        departmentId: managerDepartmentId,
        page: currentPage,
        size: pageSize,
      });

      if (response.items) {
        // Filter out Admin users
        const filteredUsers = response.items.filter(
          (user) => user.role.roleName !== "Admin"
        );
        setUsers(filteredUsers);
        setTotal(response.total);
      }
    } catch (error: any) {
      toast.error(`Error loading users: ${error.message}`);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (managerDepartmentId) {
      calculateStats();
      loadUsers();
    }
  }, [managerDepartmentId, currentPage, pageSize, filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      email: "",
      fullName: "",
      phone: "",
      roleId: "",
      createdFrom: "",
      createdTo: "",
      permissionId: "",
    });
    setCurrentPage(1);
  };

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const expandedRowRender = (record: any) => {
    return (
      <div className="p-4 rounded-lg bg-gray-50">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Text strong>
                <SafetyOutlined className="mr-2 text-purple-600" />
                Permissions
              </Text>
              <div className="flex flex-wrap gap-1">
                {record.permissions.map((permission: any) => (
                  <Tag key={permission.id} color="purple" className="mb-1">
                    {permission.name}
                  </Tag>
                ))}
              </div>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Text strong>
                <BankOutlined className="mr-2 text-blue-600" />
                Department Details
              </Text>
              <Tag color="blue">{record.department.name}</Tag>
              <Text type="secondary" className="text-sm">
                <CalendarOutlined className="mr-1" />
                Joined: {new Date(record.creatAt).toLocaleDateString()}
              </Text>
            </Space>
          </Col>
        </Row>
      </div>
    );
  };

  // Check if user is Manager
  if (!user || user.role?.roleName !== "Manager") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Alert
          message="Access Denied"
          description="Only users with Manager role can access this page."
          type="error"
          showIcon
          className="max-w-md"
        />
      </div>
    );
  }

  if (!managerDepartmentId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Alert
          message="Department Not Found"
          description="Manager department information is missing. Please contact administrator."
          type="error"
          showIcon
          className="max-w-md"
        />
      </div>
    );
  }

  const columns = [
    {
      title: "User",
      key: "user",
      render: (record: any) => (
        <Space>
          <Avatar
            size="large"
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          >
            {record.fullName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{record.fullName}</div>
            <div className="text-sm text-gray-500">
              <MailOutlined className="mr-1" />
              {record.email}
            </div>
            <div className="text-sm text-gray-500">
              <PhoneOutlined className="mr-1" />
              {record.phone}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: ["role", "roleName"],
      key: "role",
      render: (role: string) => (
        <Tag color="blue" className="font-medium">
          {role}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "status",
      render: (active: boolean) => (
        <Badge
          status={active ? "success" : "error"}
          text={active ? "Active" : "Inactive"}
        />
      ),
    },
    {
      title: "Created",
      dataIndex: "creatAt",
      key: "created",
      render: (date: string) => (
        <div className="text-sm text-gray-600">
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   render: () => {
    //     const items: MenuProps["items"] = [
    //       {
    //         key: "view",
    //         label: "View Details",
    //         icon: <EyeOutlined />,
    //       },
    //     ];

    //     return (
    //       <Dropdown menu={{ items }} trigger={["click"]}>
    //         <Button type="text" icon={<MoreOutlined />} />
    //       </Dropdown>
    //     );
    //   },
    // },
  ];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="mb-2">
            <TeamOutlined className="mr-3 text-blue-600" />
            Department Users Management
          </Title>
          <Text type="secondary" className="text-base">
            Manage users in {departmentName} department
          </Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center transition-shadow shadow-sm hover:shadow-md">
              <Statistic
                title="Total Users"
                value={loading ? 0 : userStats.totalUsers}
                loading={loading}
                prefix={<TeamOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center transition-shadow shadow-sm hover:shadow-md">
              <Statistic
                title="New Users Today"
                value={loading ? 0 : userStats.newUsersToday}
                loading={loading}
                prefix={<UserAddOutlined className="text-green-600" />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center transition-shadow shadow-sm hover:shadow-md">
              <Statistic
                title="Active Users"
                value={loading ? 0 : userStats.activeUsers}
                loading={loading}
                prefix={<CheckOutlined className="text-orange-600" />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center transition-shadow shadow-sm hover:shadow-md">
              <Statistic
                title="Churn Rate"
                value={userStats.churnRate}
                loading={loading}
                prefix={<FallOutlined className="text-red-600" />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Users Table */}
        <Card className="shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Title level={4} className="mb-0">
              <UserOutlined className="mr-2 text-blue-600" />
              Users List
            </Title>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-blue-600" : ""}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 mb-4 border rounded-lg bg-gray-50"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <Text strong className="block mb-2">
                      Email
                    </Text>
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search by email..."
                      value={filters.email}
                      onChange={(e) =>
                        handleFilterChange("email", e.target.value)
                      }
                      allowClear
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <Text strong className="block mb-2">
                      Full Name
                    </Text>
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search by name..."
                      value={filters.fullName}
                      onChange={(e) =>
                        handleFilterChange("fullName", e.target.value)
                      }
                      allowClear
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <Text strong className="block mb-2">
                      Phone
                    </Text>
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search by phone..."
                      value={filters.phone}
                      onChange={(e) =>
                        handleFilterChange("phone", e.target.value)
                      }
                      allowClear
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <Text strong className="block mb-2">
                      Role
                    </Text>
                    <Select
                      placeholder="Select role..."
                      value={filters.roleId}
                      onChange={(value) => handleFilterChange("roleId", value)}
                      allowClear
                      style={{ width: "100%" }}
                    >
                      {roles?.items
                        ?.filter((role) => role.roleName !== "Admin")
                        ?.map((role) => (
                          <Select.Option key={role.id} value={role.id}>
                            {role.roleName}
                          </Select.Option>
                        ))}
                    </Select>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <Text strong className="block mb-2">
                      Permission
                    </Text>
                    <Select
                      placeholder="Select permission..."
                      value={filters.permissionId}
                      onChange={(value) =>
                        handleFilterChange("permissionId", value)
                      }
                      allowClear
                      style={{ width: "100%" }}
                    >
                      {permissions?.items?.map((permission) => (
                        <Select.Option
                          key={permission.id}
                          value={permission.id}
                        >
                          {permission.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <Text strong className="block mb-2">
                      Date Range
                    </Text>
                    <RangePicker
                      style={{ width: "100%" }}
                      onChange={(dates) => {
                        if (dates) {
                          handleFilterChange(
                            "createdFrom",
                            dates[0]?.format("YYYY-MM-DD") || ""
                          );
                          handleFilterChange(
                            "createdTo",
                            dates[1]?.format("YYYY-MM-DD") || ""
                          );
                        } else {
                          handleFilterChange("createdFrom", "");
                          handleFilterChange("createdTo", "");
                        }
                      }}
                    />
                  </div>
                </Col>
              </Row>
              <div className="flex justify-end mt-4">
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            </motion.div>
          )}

          <Table
            columns={columns}
            dataSource={users}
            loading={usersLoading}
            rowKey="id"
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              onExpandedRowsChange: (keys) =>
                setExpandedRowKeys(keys as string[]),
            }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            onChange={handleTableChange}
            className="overflow-x-auto"
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default UserManagerPage;
