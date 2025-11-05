import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaTrash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { deleteListing } from '../api/listings';
import { toast } from 'react-toastify';

const ListingCard = ({
  id,
  title,
  price = 0,
  image,
  category,
  condition,
  sellerName,
  sellerRating = 0,
  date,
  sellerId,
  onDelete,
  showDeleteButton = false
}) => {
  const { user, token } = useContext(AuthContext);
  
  const handleDelete = async (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteListing(id, token);
        toast.success('Listing deleted successfully');
        if (onDelete) onDelete(id);
      } catch (err) {
        toast.error('Failed to delete listing');
        console.error('Error deleting listing:', err);
      }
    }
  };

  const isOwner = user && (user.id === sellerId || user._id === sellerId);

  return (
    <Link to={`/product/${id}`} className="block relative">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="h-48 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
            <span className="font-bold text-green-600">
              {typeof price === 'number' && !isNaN(price) ? `$${price.toFixed(2)}` : 'N/A'}
            </span>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
              {category}
            </span>
            <span className="mx-2">•</span>
            <span>{condition}</span>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="text-sm">
                <p className="font-medium">{sellerName}</p>
                <div className="flex items-center">
                  <FaStar
                    size={14}
                    className="text-yellow-500"
                    fill="currentColor"
                  />
                  <span className="ml-1 text-gray-600">
                    {typeof sellerRating === 'number' && !isNaN(sellerRating) ? sellerRating.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
        </div>
        {showDeleteButton && isOwner && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
            title="Delete listing"
          >
            <FaTrash size={14} />
          </button>
        )}
      </div>
    </Link>
  );
};

export default ListingCard; 