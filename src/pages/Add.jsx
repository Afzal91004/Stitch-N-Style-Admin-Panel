import React, { useState } from "react";
import { Upload, X, Check, Camera, ImagePlus } from "lucide-react";
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
        <div className="relative w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
          <img
            src={imagePreviews[id]}
            alt="Preview"
            className="w-full h-full object-cover rounded-xl border-2 border-pink-500 shadow-md"
          />
          <button
            onClick={() => removeImage(id)}
            className="absolute top-1 right-1 xs:top-2 xs:right-2 bg-white rounded-full p-1 shadow-lg z-10"
            type="button"
          >
            <X className="w-3 h-3 md:w-4 md:h-4 text-pink-600" />
          </button>
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-xl transition-all duration-300"></div>
        </div>
      );
    }

    return (
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-500 hover:bg-pink-50/30 transition-all duration-300 cursor-pointer group"
      >
        <ImagePlus className="w-5 h-5 xs:w-6 xs:h-6 md:w-8 md:h-8 text-gray-400 group-hover:text-pink-500 transition-colors duration-300" />
        <span className="mt-1 md:mt-2 text-xs font-medium text-gray-500 group-hover:text-pink-500 transition-colors duration-300 text-center px-1">
          Add Image
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
    <div className="w-full max-w-4xl mx-auto my-4 sm:my-6 md:my-8 px-2 xs:px-3 sm:px-4 md:px-0">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
        <div className="p-3 xs:p-4 sm:p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-pink-500 to-pink-600">
          <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-white flex items-center">
            <Camera className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" />
            Add New Product
          </h2>
        </div>

        <div className="p-3 xs:p-4 sm:p-6 md:p-8">
          <form
            onSubmit={onSubmitHandler}
            className="space-y-4 sm:space-y-6 md:space-y-8"
          >
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Product Images
              </label>
              <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap">
                {["image1", "image2", "image3", "image4"].map((id) =>
                  renderUploadBox(id)
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2">
              <div className="space-y-1 sm:space-y-2">
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-300 shadow-sm"
                  required
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 text-gray-500">
                    ₹
                  </span>
                  <input
                    id="price"
                    type="text"
                    value={price}
                    onChange={handlePriceChange}
                    placeholder="0.00"
                    className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-300 shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
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
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-300 min-h-[80px] xs:min-h-[100px] sm:min-h-[120px] resize-y shadow-sm"
                required
              />
            </div>

            <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2">
              <div className="space-y-1 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-300 bg-white appearance-none shadow-sm"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sub-Category
                </label>
                <div className="relative">
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-300 bg-white appearance-none shadow-sm"
                  >
                    <option value="Top-Wear">Top Wear</option>
                    <option value="Bottom-Wear">Bottom Wear</option>
                    <option value="Winter-Wear">Winter Wear</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Product Sizes
              </label>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl font-medium transition-all duration-300 ${
                      selectedSizes.includes(size)
                        ? "bg-pink-600 text-white shadow-lg shadow-pink-200"
                        : "bg-gray-100 text-gray-600 hover:bg-pink-100"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="bestseller"
                  checked={bestSeller}
                  onChange={(e) => setBestSeller(e.target.checked)}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500 transition-colors cursor-pointer"
                />
                <label
                  htmlFor="bestseller"
                  className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Add to BestSeller
                </label>
                {bestSeller && (
                  <span className="absolute -right-2 -top-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500" />
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 xs:px-6 sm:px-8 py-2 xs:py-2.5 sm:py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 shadow-md sm:shadow-lg hover:shadow-pink-300 w-full sm:w-auto
                  ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:from-pink-500 hover:to-pink-600"
                  }`}
              >
                {loading ? "Adding Product..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add;
