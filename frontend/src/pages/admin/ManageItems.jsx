import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { getAdminListings } from '../../api/admin.jsx';
import ListingCard from '../../components/ListingCard.jsx';

const ManageItems = () => {
  const { token } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getAdminListings({ token, search });
      setItems(res.items || []);
    } catch (_) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Items</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search title or description"
          className="border p-2 rounded flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchItems} className="bg-indigo-600 text-white px-4 py-2 rounded">Search</button>
      </div>
      {loading ? 'Loading...' : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(listing => (
            <ListingCard
              key={listing._id || listing.id}
              id={listing._id || listing.id}
              title={listing.title}
              price={listing.price}
              image={listing.images?.[0] || listing.image}
              category={listing.category}
              condition={listing.condition || 'Good'}
              sellerName={listing.seller?.name || 'N/A'}
              sellerRating={listing.seller?.averageRating || 0}
              date={listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : ''}
            />
          ))}
          {items.length === 0 && <div>No items found.</div>}
        </div>
      )}
    </div>
  );
};

export default ManageItems;



