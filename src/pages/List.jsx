import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { Trash2, Edit2, X, Search, Tag, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    sizes: [],
    bestSeller: false,
  });

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
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

      // Debug logging
      console.log("Form submission details:", {
        id: formData.id,
        name: formData.name,
        price: {
          original: formData.price,
          validated: numericPrice,
          type: typeof formData.price,
        },
        sizes: sizesArray,
        bestSeller: formData.bestSeller ? "true" : "false",
      });

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
    console.log("Loading product for edit:", {
      originalPrice: product.price,
      convertedPrice: priceValue,
      originalType: typeof product.price,
      convertedType: typeof priceValue,
    });

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
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-600">
            Products Inventory
          </h2>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center">
          <div className="bg-gray-50 rounded-xl p-1 flex items-center shadow-sm border border-gray-100">
            <Search className="h-4 w-4 text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent border-none focus:ring-0 text-sm px-2 py-1 w-40 md:w-auto"
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-xl font-bold text-indigo-600">
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

            <form onSubmit={handleUpdate} className="space-y-6">
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
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
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
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className="w-full rounded-xl border border-gray-300 pl-8 pr-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
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
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
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
                    setFormData({ ...formData, subCategory: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="space-y-2">
                      <div className="relative group">
                        <input
                          type="file"
                          name={`image${num}`}
                          accept="image/*"
                          className="block w-full text-sm text-gray-500 
                            file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                            file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 
                            hover:file:bg-indigo-100 cursor-pointer"
                        />
                        {editingProduct.image[num - 1] && (
                          <div className="mt-2 relative group rounded-lg overflow-hidden">
                            <img
                              src={editingProduct.image[num - 1]}
                              alt={`Current ${num}`}
                              className="h-24 w-full object-cover rounded-lg border border-indigo-100"
                            />
                            <div className="absolute inset-0 bg-indigo-900 bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-sm">
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
                    setFormData({ ...formData, bestSeller: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="bestSeller"
                  className="text-sm font-medium text-gray-700"
                >
                  Best Seller
                </label>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors duration-200 shadow-md"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-4 items-center p-4 bg-gray-50 rounded-xl mb-6 font-medium text-gray-600 text-sm">
        <span>Image</span>
        <span>Name</span>
        <span>Category</span>
        <span>Price</span>
        <span className="text-center">Actions</span>
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          list.map((item, index) => (
            <div
              key={index}
              className="grid md:grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-4 items-center p-5 bg-white rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300"
            >
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
                <p className="text-sm text-gray-500 md:hidden flex items-center gap-1">
                  <Tag className="h-3 w-3" /> {item.category}
                </p>
                <p className="text-sm text-gray-500 md:hidden flex items-center gap-1">
                  <span>{currency}</span> {item.price}
                </p>
              </div>

              <div className="hidden md:flex items-center">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                  {item.category}
                </span>
              </div>

              <p className="hidden md:block font-medium text-gray-700">
                {currency} {item.price}
              </p>

              <div className="flex justify-center gap-3">
                {/* <button
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                  title="Edit product"
                  onClick={() => handleEdit(item)}
                >
                  <Edit2 size={18} />
                </button> */}
                <button
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-red-100"
                  title="Delete product"
                  onClick={() => removeProduct(item._id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default List;
