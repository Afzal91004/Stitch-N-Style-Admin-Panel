import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import {
  Trash2,
  Edit2,
  X,
  Search,
  Tag,
  ShoppingBag,
  ChevronDown,
  Filter,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    sizes: [],
    bestSeller: false,
  });

  // Extract unique categories for filter
  const categories = [...new Set(list.map((item) => item.category))];

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
      } else {
        console.error(error);
        toast.error(error.response?.data?.message || "Error fetching products");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Convert price to number for validation
      const numericPrice = parseFloat(formData.price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        toast.error("Please enter a valid price greater than 0");
        return;
      }

      // Create FormData with fields matching server expectations
      const form = new FormData();

      // Basic fields - ensure all fields are sent as strings
      form.append("id", formData.id);
      form.append("name", formData.name);
      form.append("description", formData.description || "");
      form.append("price", formData.price); // Send original string value
      form.append("category", formData.category);
      form.append("subCategory", formData.subCategory || "");

      // Handle sizes array
      const sizesArray = Array.isArray(formData.sizes) ? formData.sizes : [];
      form.append("sizes", JSON.stringify(sizesArray));

      // Convert boolean to string as expected by server
      form.append("bestSeller", formData.bestSeller ? "true" : "false");

      // Handle file uploads
      const fileInputs = e.target.querySelectorAll('input[type="file"]');
      for (let i = 0; i < fileInputs.length; i++) {
        const file = fileInputs[i].files[0];
        if (file) {
          // Server expects files in numbered format: image1, image2, etc.
          form.append(`image${i + 1}`, file);
        }
      }

      const response = await axios({
        method: "post",
        url: `${backendUrl}/api/product/edit`,
        data: form,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setEditingProduct(null);
        await fetchList();
      } else {
        toast.error(response.data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Update error:", {
        message: error.message,
        response: error.response?.data,
      });
      toast.error(error.response?.data?.message || "Error updating product");
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.trim();
    // Allow digits and a single decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numericValue = parseFloat(value);
      if (value === "" || (!isNaN(numericValue) && numericValue >= 0)) {
        setFormData((prev) => ({ ...prev, price: value }));
      }
    }
  };

  const handleEdit = (product) => {
    const priceValue = String(product.price);

    setEditingProduct(product);
    setFormData({
      id: product._id,
      name: product.name,
      description: product.description || "",
      price: priceValue,
      category: product.category,
      subCategory: product.subCategory || "",
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      bestSeller: Boolean(product.bestSeller),
    });
  };

  const removeProduct = async (id) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(error.response?.data?.message || "Error removing product");
        console.error(error);
      }
    }
  };

  // Filter products based on search term and category
  const filteredList = list.filter((item) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (token) {
      fetchList();
    }
  }, [token]);

  // Skeleton Loader Components
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="md:hidden">
        <div className="flex items-start p-4">
          <div className="w-20 h-20 rounded-xl bg-gray-200 flex-shrink-0"></div>
          <div className="ml-4 flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="flex border-t border-gray-100">
          <div className="flex-1 p-2 bg-gray-100"></div>
          <div className="w-px bg-gray-200"></div>
          <div className="flex-1 p-2 bg-gray-100"></div>
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-4 items-center p-4">
        <div className="w-16 h-16 rounded-xl bg-gray-200"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex justify-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  const SkeletonHeader = () => (
    <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-100 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-full md:w-auto mt-4 md:mt-0 flex items-center gap-2">
          <div className="relative flex-1 md:flex-none">
            <div className="w-full md:w-64 h-10 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
      {loading ? (
        <>
          <SkeletonHeader />
          <div className="flex flex-col gap-3 md:gap-4">
            {[...Array(5)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-pink-600">
                  Products Inventory
                </h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  {filteredList.length} products in your catalog
                </p>
              </div>

              <div className="w-full md:w-auto mt-4 md:mt-0 flex items-center gap-2">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-300 focus:ring-1 focus:ring-pink-300 text-sm"
                  />
                </div>

                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="p-2 rounded-xl border border-gray-200 hover:border-pink-200 text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                >
                  <Filter size={18} />
                </button>
              </div>
            </div>

            {isFilterOpen && (
              <div className="flex flex-wrap gap-2 mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100 animate-fadeIn">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === ""
                      ? "bg-pink-100 text-pink-700 border border-pink-200"
                      : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-pink-100 text-pink-700 border border-pink-200"
                        : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Edit Modal */}
          {editingProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <h3 className="text-lg md:text-xl font-bold text-pink-600">
                    Edit Product
                  </h3>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 text-gray-500 hover:text-gray-700"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form
                  onSubmit={handleUpdate}
                  className="space-y-4 md:space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 md:py-3 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 md:py-3 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 shadow-sm"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          {currency}
                        </span>
                        <input
                          type="text"
                          value={formData.price}
                          onChange={handlePriceChange}
                          pattern="^\d+$"
                          inputMode="numeric"
                          className="w-full rounded-xl border border-gray-300 pl-8 pr-4 py-2 md:py-3 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 shadow-sm"
                          required
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 md:py-3 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub Category
                    </label>
                    <input
                      type="text"
                      value={formData.subCategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subCategory: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 md:py-3 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="space-y-2">
                          <div className="relative group">
                            <input
                              type="file"
                              name={`image${num}`}
                              accept="image/*"
                              className="block w-full text-sm text-gray-500 
                                file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                                file:text-sm file:font-medium file:bg-pink-50 file:text-pink-700 
                                hover:file:bg-pink-100 cursor-pointer"
                            />
                            {editingProduct.image[num - 1] && (
                              <div className="mt-2 relative group rounded-lg overflow-hidden">
                                <img
                                  src={editingProduct.image[num - 1]}
                                  alt={`Current ${num}`}
                                  className="h-20 md:h-24 w-full object-cover rounded-lg border border-pink-100"
                                />
                                <div className="absolute inset-0 bg-pink-900 bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-sm">
                                  Current Image
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="bestSeller"
                      checked={formData.bestSeller}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bestSeller: e.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <label
                      htmlFor="bestSeller"
                      className="text-sm font-medium text-gray-700"
                    >
                      Best Seller
                    </label>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 mb-2 sm:mb-0 bg-gradient-to-r from-pink-600 to-pink-600 text-white font-medium rounded-xl hover:from-pink-700 hover:to-purple-700 transition-colors duration-200 shadow-md"
                    >
                      Update Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Table Header - Desktop Only */}
          <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-4 items-center p-4 bg-gray-50 rounded-xl mb-4 font-medium text-gray-600 text-sm">
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span className="text-center">Actions</span>
          </div>

          {/* Empty State */}
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No products found
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                {searchTerm || selectedCategory
                  ? "Try adjusting your search or filter criteria."
                  : "Add your first product to get started."}
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                  }}
                  className="px-4 py-2 bg-pink-50 text-pink-600 rounded-lg font-medium text-sm hover:bg-pink-100 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:gap-4">
              {filteredList
                .slice()
                .reverse()
                .map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-100 hover:border-pink-100 hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    {/* Mobile View */}
                    <div className="md:hidden">
                      <div className="flex items-start p-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm flex-shrink-0">
                          <img
                            src={item.image[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-gray-900 mb-1 pr-2">
                              {item.name}
                            </h3>
                            <button
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Delete product"
                              onClick={() => removeProduct(item._id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {item.bestSeller && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                Best Seller
                              </span>
                            )}
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-600">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <span>{currency}</span> {item.price}
                          </p>
                        </div>
                      </div>
                      <div className="flex border-t border-gray-100">
                        <button
                          className="flex-1 p-2 text-pink-600 hover:bg-pink-50 font-medium text-sm flex justify-center items-center gap-1"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <div className="w-px bg-gray-100"></div>
                        <button className="flex-1 p-2 text-gray-600 hover:bg-gray-50 font-medium text-sm flex justify-center items-center gap-1">
                          <Download size={16} /> Export
                        </button>
                      </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:grid md:grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-4 items-center p-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                        <img
                          src={item.image[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-900 flex items-center">
                          {item.name}
                          {item.bestSeller && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Best Seller
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {item.description}
                        </p>
                      </div>

                      <div>
                        <span className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium">
                          {item.category}
                        </span>
                      </div>

                      <p className="font-medium text-gray-700">
                        {currency} {item.price}
                      </p>

                      <div className="flex justify-center gap-2">
                        <button
                          className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-pink-100"
                          title="Edit product"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-red-100"
                          title="Delete product"
                          onClick={() => removeProduct(item._id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Pagination */}
          {filteredList.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium">{filteredList.length}</span> of{" "}
                <span className="font-medium">{list.length}</span> products
              </p>
              <div className="flex gap-1">
                <button className="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>
                <button className="px-3 py-1 rounded-lg bg-pink-50 border border-pink-100 text-pink-600 font-medium">
                  1
                </button>
                <button className="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default List;
