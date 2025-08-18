import React from 'react';
import AdminRouteDemo from '../components/AdminRouteDemo';

/**
 * Trang test để kiểm tra logic AdminRoute
 * Có thể truy cập tạm thời qua route /admin-test
 */
const AdminRouteTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <AdminRouteDemo />
      </div>
    </div>
  );
};

export default AdminRouteTestPage;
