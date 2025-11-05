import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { getAdminUsers } from '../../api/admin.jsx';

const ManageUsers = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getAdminUsers({ token, limit: 10, search });
      setUsers(data);
    } catch (_) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border p-2 rounded flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchUsers} className="bg-indigo-600 text-white px-4 py-2 rounded">Search</button>
      </div>
      {loading ? 'Loading...' : (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.isAdmin ? 'Admin' : 'User'}</td>
                  <td className="p-3">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</td>
                  <td className="p-3">
                    <a href={`/admin/users/${u._id}`} className="text-indigo-600 hover:underline">View</a>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td className="p-3" colSpan="5">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;



