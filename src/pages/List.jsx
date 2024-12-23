import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { Trash2, Edit2, X } from "lucide-react";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
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
    <div className="w-full bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-2xl font-semibold mb-6">Products List</h2>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Product</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={handlePriceChange}
                    pattern="^\d+$"
                    inputMode="numeric"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                    placeholder="Enter Price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sub Category
                </label>
                <input
                  type="text"
                  value={formData.subCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subCategory: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="space-y-2">
                      <input
                        type="file"
                        name={`image${num}`}
                        accept="image/*"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {editingProduct.image[num - 1] && (
                        <div className="relative group">
                          <img
                            src={editingProduct.image[num - 1]}
                            alt={`Current ${num}`}
                            className="h-20 w-20 object-cover rounded"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center text-white text-sm">
                            Current Image
                          </div>
                        </div>
                      )}
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
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="bestSeller"
                  className="text-sm font-medium text-gray-700"
                >
                  Best Seller
                </label>
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-4 items-center p-4 bg-gray-50 rounded-lg mb-4">
        <span className="font-medium text-gray-600">Image</span>
        <span className="font-medium text-gray-600">Name</span>
        <span className="font-medium text-gray-600">Category</span>
        <span className="font-medium text-gray-600">Price</span>
        <span className="font-medium text-gray-600 text-center">Actions</span>
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-4">
        {list.map((item, index) => (
          <div
            key={index}
            className="grid md:grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-4 items-center p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={item.image[0]}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500 md:hidden">
                Category: {item.category}
              </p>
              <p className="text-sm text-gray-500 md:hidden">
                Price: {currency}
                {item.price}
              </p>
            </div>
            <p className="hidden md:block text-gray-600">{item.category}</p>
            <p className="hidden md:block text-gray-600">
              {currency}
              {item.price}
            </p>
            <div className="flex justify-center gap-2">
              {/* <button
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Edit product"
                onClick={() => handleEdit(item)}
              >
                <Edit2 size={20} />
              </button> */}
              <button
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete product"
                onClick={() => removeProduct(item._id)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {list.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
};

export default List;
