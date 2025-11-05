import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { getAdminComplaints } from '../../api/admin.jsx';

const Complaints = () => {
  const { token } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getAdminComplaints({ token, status });
      setComplaints(data);
    } catch (_) {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Complaints</h1>
      <div className="flex gap-2 mb-4">
        <select className="border p-2 rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <button onClick={fetchComplaints} className="bg-indigo-600 text-white px-4 py-2 rounded">Filter</button>
      </div>
      {loading ? 'Loading...' : (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Subject</th>
                <th className="p-3">User</th>
                <th className="p-3">Listing</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c._id} className="border-b">
                  <td className="p-3">{c.subject}</td>
                  <td className="p-3">{c.user?.name} ({c.user?.email})</td>
                  <td className="p-3">{c.listing?.title || 'N/A'}</td>
                  <td className="p-3">{c.status}</td>
                  <td className="p-3">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr><td className="p-3" colSpan="5">No complaints found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Complaints;



