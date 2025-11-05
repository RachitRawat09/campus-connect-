import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createListing, uploadImages } from "../api/listings.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

const categories = [
  "Textbooks",
  "Electronics",
  "Calculators",
  "Lab Equipment",
  "Notes & Study Guides",
  "Office Supplies",
  "Other",
];
const conditions = ["Like New", "Very Good", "Good", "Acceptable"];

const CreateListing = ({ onCreated }) => {
  const { user, token } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    condition: "",
    department: "",
    images: [],
  });
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      const fileArray = Array.from(files).slice(0, 4);

      // Check file sizes
      const oversizedImages = fileArray.filter((file) => file.size > 50 * 1024); // 50KB in bytes
      if (oversizedImages.length > 0) {
        toast.error(
          "Each image must be less than 50KB. Please compress your images and try again."
        );
        e.target.value = ""; // Reset the file input
        return;
      }

      setForm((prev) => ({ ...prev, images: fileArray }));
      setPreviews(fileArray.map((f) => URL.createObjectURL(f)));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.title ||
      !form.description ||
      !form.category ||
      !form.price ||
      !form.condition ||
      !form.department
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!form.images || form.images.length === 0) {
      toast.error("Please upload at least 1 image (max 4).");
      return;
    }
    if (!user || !(user._id || user.id)) {
      toast.error("User not found. Please log in again.");
      return;
    }
    setLoading(true);
    try {
      const imageUrls = await uploadImages(form.images);
      const data = {
        title: form.title,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price),
        condition: form.condition,
        department: form.department,
        images: imageUrls,
        seller: user.id || user._id,
      };
      await createListing(data, token);
      toast.success("Listing created successfully!");
      setForm({
        title: "",
        description: "",
        category: "",
        price: "",
        condition: "",
        department: "",
        images: [],
      });
      setPreviews([]);
      if (onCreated) onCreated();
    } catch (err) {
      toast.error("Failed to create listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Sell Your Items
        </h1>
        <p className="text-lg text-gray-600">
          List your items for sale to other students
        </p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Condition *</label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select condition</option>
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Department *</label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Price (USD) *</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Images (1-4) *</label>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="w-full"
            />
            <p className="text-red-500 text-sm mt-1">
              Note: Each image must be less than 50KB in size
            </p>
            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {previews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`preview-${idx}`}
                    className="w-full h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
