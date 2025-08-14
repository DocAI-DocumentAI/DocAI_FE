import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

/**
 * Component demo để kiểm tra logic AdminRoute
 * Hiển thị thông tin về trạng thái authentication và role của user
 */
const AdminRouteDemo: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Admin Route Demo</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Authentication Status:</h3>
          <p className={`text-lg ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
            {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          </p>
        </div>

        {isAuthenticated && user ? (
          <div>
            <h3 className="text-lg font-semibold">User Information:</h3>
            <div className="bg-white p-4 rounded border">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Full Name:</strong> {user.fullName}</p>
              <p><strong>Role:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  user.role.roleName === 'Admin' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.role.roleName}
                </span>
              </p>
              <p><strong>Department:</strong> {user.department.name}</p>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold">User Information:</h3>
            <p className="text-gray-500">No user data available</p>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold">Admin Access Check:</h3>
          <div className="bg-white p-4 rounded border">
            {!isAuthenticated ? (
              <p className="text-red-600">❌ Not authenticated - Would redirect to /login</p>
            ) : !user ? (
              <p className="text-red-600">❌ No user data - Would redirect to /</p>
            ) : user.role.roleName !== 'Admin' ? (
              <p className="text-red-600">❌ Not Admin role - Would redirect to /</p>
            ) : (
              <p className="text-green-600">✅ Admin access granted - Can access admin routes</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Test Scenarios:</h3>
          <div className="bg-white p-4 rounded border space-y-2">
            <p><strong>1. Not logged in:</strong> Try accessing /admin → Should redirect to /login</p>
            <p><strong>2. Logged in as non-Admin:</strong> Try accessing /admin → Should redirect to /</p>
            <p><strong>3. Logged in as Admin:</strong> Try accessing /admin → Should show admin dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRouteDemo;
