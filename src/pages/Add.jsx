import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [imageFiles, setImageFiles] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });
  const [imagePreviews, setImagePreviews] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Top-Wear");
  const [bestSeller, setBestSeller] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (
      value === "" ||
      (/^\d*\.?\d{0,2}$/.test(value) && parseFloat(value) >= 0)
    ) {
      setPrice(value);
    }
  };

  const handleImageChange = (e, imageKey) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
        toast.error("Only JPG, JPEG, and PNG files are allowed");
        return;
      }

      // Store file for upload
      setImageFiles((prev) => ({
        ...prev,
        [imageKey]: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => ({
          ...prev,
          [imageKey]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (imageKey) => {
    setImageFiles((prev) => ({
      ...prev,
      [imageKey]: null,
    }));
    setImagePreviews((prev) => ({
      ...prev,
      [imageKey]: null,
    }));
  };

  const renderUploadBox = (id) => {
    if (imagePreviews[id]) {
      return (
        <div className="relative w-28 h-28 group">
          <img
            src={imagePreviews[id]}
            alt="Preview"
            className="w-full h-full object-cover rounded-xl border-2 border-pink-500"
          />
          <button
            onClick={() => removeImage(id)}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            type="button"
          >
            <X className="w-4 h-4 text-pink-500" />
          </button>
        </div>
      );
    }

    return (
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-500 hover:bg-pink-50/30 transition-all duration-300 cursor-pointer group"
      >
        <Upload className="w-6 h-6 text-gray-400 group-hover:text-pink-500 transition-colors duration-300" />
        <span className="mt-2 text-sm text-gray-500 group-hover:text-pink-500 transition-colors duration-300">
          Upload
        </span>
        <input
          onChange={(e) => handleImageChange(e, id)}
          type="file"
          id={id}
          className="hidden"
          accept="image/jpeg,image/png,image/jpg"
        />
      </label>
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Men");
    setSubCategory("Top-Wear");
    setBestSeller(false);
    setSelectedSizes([]);
    setImageFiles({
      image1: null,
      image2: null,
      image3: null,
      image4: null,
    });
    setImagePreviews({
      image1: null,
      image2: null,
      image3: null,
      image4: null,
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!name.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a product description");
      return;
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast.error("Please enter a valid price greater than 0");
      return;
    }

    if (selectedSizes.length === 0) {
      toast.error("Please select at least one size");
      return;
    }

    if (!Object.values(imageFiles).some((file) => file !== null)) {
      toast.error("Please upload at least one image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", parseFloat(price).toFixed(2));
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestSeller", bestSeller);
      formData.append("sizes", JSON.stringify(selectedSizes));

      // Append only existing images
      Object.entries(imageFiles).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const response = await axios.post(
        `${backendUrl}/api/product/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Product added successfully!");
        resetForm();
      } else {
        toast.error(response.data.message);
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error.message || "Error adding product");
    } finally {
      setLoading(false);
    }
  };

  const sizes = ["S", "M", "L", "XL"];

  return (
    <div className="w-full max-w-3xl mx-auto my-8 bg-white rounded-2xl shadow-xl">
      <div className="p-8 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800">
          Add New Product
        </h2>
      </div>

      <div className="p-8">
        <form onSubmit={onSubmitHandler} className="space-y-8">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Product Images
            </label>
            <div className="flex gap-4 flex-wrap">
              {["image1", "image2", "image3", "image4"].map((id) =>
                renderUploadBox(id)
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="productName"
                className="block text-sm font-medium text-gray-700"
              >
                Product Name
              </label>
              <input
                id="productName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price
              </label>
              <input
                id="price"
                type="text"
                value={price}
                onChange={handlePriceChange}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-300"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Product Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write product description here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-300 min-h-[120px] resize-y"
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-300 bg-white appearance-none"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sub-Category
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-300 bg-white appearance-none"
              >
                <option value="Top-Wear">Top Wear</option>
                <option value="Bottom-Wear">Bottom Wear</option>
                <option value="Winter-Wear">Winter Wear</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Product Sizes
            </label>
            <div className="flex gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`w-12 h-12 rounded-xl font-medium transition-all duration-300 ${
                    selectedSizes.includes(size)
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-200"
                      : "bg-gray-100 text-gray-600 hover:bg-pink-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="bestseller"
              checked={bestSeller}
              onChange={(e) => setBestSeller(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500 transition-colors cursor-pointer"
            />
            <label
              htmlFor="bestseller"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Add to BestSeller
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 bg-pink-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-pink-200 hover:shadow-pink-300 
              ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-pink-600"
              }`}
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;
