import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import ListingCard from '../components/ListingCard.jsx';
import { getListings } from '../api/listings.jsx';

// Mock conditions for demonstration
const conditions = [
  'Any Condition',
  'Like New',
  'Very Good',
  'Good',
  'Acceptable',
];

const hardcodedCategories = [
  'Textbooks',
  'Electronics',
  'Calculators',
  'Lab Equipment',
  'Notes & Study Guides',
  'Office Supplies',
  'Other',
];

const Browse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCondition, setSelectedCondition] = useState('Any Condition');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories] = useState(hardcodedCategories);
  const [filtersLoading] = useState(false);

  // Fetch real listings from backend
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (selectedCategory !== 'All Categories') params.category = selectedCategory;
        // No backend filter for condition/price yet, so filter on frontend
        const data = await getListings(params);
        setListings(data);
      } catch (err) {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
    // eslint-disable-next-line
  }, [searchTerm, selectedCategory]);

  // Frontend filtering for condition and price, and remove purchased items
  const filteredListings = listings.filter((listing) => {
    // Exclude purchased/sold items
    if (listing.buyer || listing.isSold) return false;
    // Condition
    if (
      selectedCondition !== 'Any Condition' &&
      listing.condition !== selectedCondition
    ) {
      return false;
    }
    // Price range
    if (priceRange.min && listing.price < parseFloat(priceRange.min)) {
      return false;
    }
    if (priceRange.max && listing.price > parseFloat(priceRange.max)) {
      return false;
    }
    return true;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedCondition('Any Condition');
    setPriceRange({ min: '', max: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Marketplace</h1>
        <p className="text-lg text-gray-600">Discover items from students across campus</p>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">
            {filteredListings.length} Available Items
          </span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {listings.length} Total Listings
          </span>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for items..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {/* Filter Toggle Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            disabled={filtersLoading}
          >
            <FaFilter size={20} className="mr-2" />
            Filters
          </button>
        </div>
        {/* Filters - Desktop */}
        <div className="hidden md:flex flex-wrap gap-4">
          {/* Category Filter */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={filtersLoading}
            >
              <option value="All Categories">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          {/* Condition Filter */}
          <div>
            <label
              htmlFor="condition"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Condition
            </label>
            <select
              id="condition"
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>
          {/* Price Range Filter */}
          <div>
            <label
              htmlFor="price-min"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price Range
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="price-min"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({
                    ...priceRange,
                    min: e.target.value,
                  })
                }
                placeholder="Min"
                className="block w-24 pl-3 pr-3 py-2 border border-gray-300 rounded-l-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <span className="px-2 border-t border-b border-gray-300 bg-gray-50 text-gray-500">
                to
              </span>
              <input
                type="number"
                id="price-max"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({
                    ...priceRange,
                    max: e.target.value,
                  })
                }
                placeholder="Max"
                className="block w-24 pl-3 pr-3 py-2 border border-gray-300 rounded-r-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <FaTimes size={16} className="mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
        {/* Filters - Mobile */}
        {showFilters && (
          <div className="md:hidden mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 space-y-4">
            {/* Category Filter */}
            <div>
              <label
                htmlFor="category-mobile"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="category-mobile"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {/* Condition Filter */}
            <div>
              <label
                htmlFor="condition-mobile"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Condition
              </label>
              <select
                id="condition-mobile"
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>
            {/* Price Range Filter */}
            <div>
              <label
                htmlFor="price-min-mobile"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price Range
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="price-min-mobile"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({
                      ...priceRange,
                      min: e.target.value,
                    })
                  }
                  placeholder="Min"
                  className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-l-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <span className="px-2 border-t border-b border-gray-300 bg-gray-50 text-gray-500">
                  to
                </span>
                <input
                  type="number"
                  id="price-max-mobile"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({
                      ...priceRange,
                      max: e.target.value,
                    })
                  }
                  placeholder="Max"
                  className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-r-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            {/* Clear Filters */}
            <button
              onClick={handleClearFilters}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <FaTimes size={16} className="mr-2" />
              Clear Filters
            </button>
          </div>
        )}
      </div>
      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          Showing {filteredListings.length} results
          {selectedCategory !== 'All Categories' && ` in ${selectedCategory}`}
          {selectedCondition !== 'Any Condition' &&
            ` in ${selectedCondition} condition`}
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>
      {/* Listings Grid */}
      {loading ? (
        <div>Loading...</div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
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
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            No items found matching your criteria.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Browse; 