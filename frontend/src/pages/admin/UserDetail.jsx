import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { getAdminUserById } from '../../api/admin.jsx';

const UserDetail = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const u = await getAdminUserById(id, token);
        setUser(u);
      } catch (_) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, token]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">User not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Detail</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>College:</strong> {user.college}</p>
        <p><strong>Role:</strong> {user.isAdmin ? 'Admin' : 'User'}</p>
        <p><strong>Joined:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : ''}</p>
      </div>
    </div>
  );
};

export default UserDetail;



