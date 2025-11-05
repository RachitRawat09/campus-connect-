import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getListingById } from "../api/listings.jsx";
import { initiateConversation } from "../api/messages.jsx";
import { createComplaint } from "../api/complaints.jsx";
import { FaStar, FaComments, FaFlag } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = React.useContext(AuthContext);
  const [messaging, setMessaging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: "",
    description: "",
  });
  const [submittingReport, setSubmittingReport] = useState(false);

  const reportTypes = [
    { value: "inappropriate_product", label: "Inappropriate Product" },
    { value: "misbehavior", label: "Misbehavior" },
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment" },
    { value: "other", label: "Other" },
  ];

  const handleReport = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      toast.error("You must be logged in to report.");
      return;
    }

    if (!reportForm.type || !reportForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmittingReport(true);
    try {
      await createComplaint(
        {
          reportedListing: listing._id,
          type: reportForm.type,
          description: reportForm.description,
        },
        token
      );

      toast.success("Report submitted successfully");
      setShowReportModal(false);
      setReportForm({ type: "", description: "" });
    } catch (err) {
      toast.error("Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getListingById(id);
        setListing(data);
      } catch (err) {
        setError("Product not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleMessage = async () => {
    if (!user || !token) {
      toast.error("You must be logged in to message.");
      return;
    }

    if (!listing.seller) {
      toast.error("Seller information not available.");
      return;
    }

    setMessaging(true);
    try {
      await initiateConversation(
        {
          receiver: listing.seller._id || listing.seller.id,
          listing: listing._id,
        },
        token
      );
      toast.success(
        "Request sent! Waiting for seller to accept. Redirecting..."
      );
      setTimeout(() => navigate("/messages"), 800);
    } catch (err) {
      toast.error("Failed to send request.");
    } finally {
      setMessaging(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Product Details</h1>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Product Details</h1>
        <div className="bg-white rounded-lg shadow p-6 text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (!listing) return null;

  // Determine images for gallery
  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : listing.image
      ? [listing.image]
      : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Product Details</h1>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-8">
        {/* Image gallery */}
        <div className="md:w-1/2 flex gap-4">
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col gap-2">
            {images.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`border rounded p-1 ${
                  activeIndex === idx ? "border-indigo-500" : "border-gray-200"
                }`}
              >
                <img
                  src={src}
                  alt={`thumb-${idx}`}
                  className="w-16 h-16 object-cover rounded"
                />
              </button>
            ))}
          </div>
          {/* Main image */}
          <div className="flex-1 flex justify-center items-center">
            <img
              src={images[activeIndex]}
              alt={listing.title}
              className="w-full max-w-md h-96 object-cover rounded-lg border"
            />
          </div>
        </div>
        {/* Details */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{listing.title}</h2>
          <div className="flex items-center gap-4">
            <span className="text-green-600 text-xl font-semibold">
              $
              {typeof listing.price === "number"
                ? listing.price.toFixed(2)
                : listing.price}
            </span>
            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
              {listing.category}
            </span>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
              {listing.condition}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-medium">Seller:</span>
            <span>{listing.seller?.name || "N/A"}</span>
            <FaStar size={16} className="text-yellow-500 ml-2" />
            <span className="text-gray-600 text-sm">
              {listing.seller?.averageRating
                ? listing.seller.averageRating.toFixed(1)
                : "N/A"}
            </span>
          </div>
          <div className="text-gray-500 text-sm">
            Listed on:{" "}
            {listing.createdAt
              ? new Date(listing.createdAt).toLocaleDateString()
              : "N/A"}
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-1">Description</h3>
            <p className="text-gray-700">
              {listing.description || "No description provided."}
            </p>
          </div>
          {/* Message Button */}
          {!listing.isSold &&
            user &&
            listing.seller?.id !== user.id &&
            listing.seller?._id !== user.id && (
              <button
                onClick={handleMessage}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-4 w-max flex items-center gap-2 hover:bg-blue-700 transition-colors"
                disabled={messaging}
              >
                <FaComments />
                {messaging ? "Sending..." : "Message Seller"}
              </button>
            )}

          {/* Sold Status */}
          {listing.isSold && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mt-4">
              <strong>This item has been sold</strong>
            </div>
          )}

          {/* Owner Notice */}
          {user &&
            (listing.seller?.id === user.id ||
              listing.seller?._id === user.id) && (
              <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg mt-4">
                <strong>This is your listing</strong>
                {!listing.isSold && (
                  <button
                    onClick={() => navigate(`/messages`)}
                    className="block mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Messages
                  </button>
                )}
              </div>
            )}

          {/* Report Button - Show only if user is logged in and not the owner */}
          {user &&
            listing.seller?.id !== user.id &&
            listing.seller?._id !== user.id && (
              <button
                onClick={() => setShowReportModal(true)}
                className="mt-4 text-red-600 hover:text-red-700 flex items-center gap-2"
              >
                <FaFlag /> Report this listing
              </button>
            )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Report Listing</h3>
            <form onSubmit={handleReport}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Reason for Report *
                </label>
                <select
                  value={reportForm.type}
                  onChange={(e) =>
                    setReportForm((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select a reason</option>
                  {reportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) =>
                    setReportForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  rows="4"
                  placeholder="Please provide details about your report..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {submittingReport ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
