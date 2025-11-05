import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { getAdminStats } from '../api/admin.jsx';

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalUsers: 0, totalListings: 0, reportedItems: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getAdminStats(token);
        setStats(data);
      } catch (err) {
        setStats({ totalUsers: 0, totalListings: 0, reportedItems: 0 });
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-3xl font-bold">{loading ? '...' : stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Listings</p>
          <p className="text-3xl font-bold">{loading ? '...' : stats.totalListings}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Reported Items</p>
          <p className="text-3xl font-bold">{loading ? '...' : stats.reportedItems}</p>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:bg-gray-50">Manage Users →</a>
        <a href="/admin/items" className="bg-white rounded-lg shadow p-6 hover:bg-gray-50">Manage Items →</a>
        <a href="/admin/complaints" className="bg-white rounded-lg shadow p-6 hover:bg-gray-50">Complaints →</a>
      </div>
    </div>
  );
};

export default AdminDashboard;
