import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";
import { assets } from "../assets/admin_assets/assets";
import {
  Calendar,
  Package,
  User,
  ShoppingBag,
  Truck,
  Check,
} from "lucide-react";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = async () => {
    if (!token) return null;
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: event.target.value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "orderPlaced":
        return "bg-blue-500";
      case "Packing":
        return "bg-yellow-500";
      case "Shipped":
        return "bg-indigo-500";
      case "Out for delivery":
        return "bg-purple-500";
      case "Delivered":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-gray-50 to-white min-h-screen rounded-xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-pink-600 bg-clip-text ">
          Orders Dashboard
        </h1>
        <div className="mt-4 md:mt-0 flex items-center">
          <span className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full text-sm font-medium shadow-md">
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          </div>
        ) : orders.length > 0 ? (
          orders.map((order, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="grid md:grid-cols-4 gap-6 p-6">
                {/* Order Items Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <Package className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-semibold text-gray-800">Order Items</h3>
                  </div>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {item.name}{" "}
                            <span className="text-indigo-500">×</span>{" "}
                            {item.quantity}
                          </p>
                          <span className="text-xs px-2 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium">
                            {item.size}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <User className="w-5 h-5 text-rose-500" />
                    <h3 className="font-semibold text-gray-800">
                      Delivery Address
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <p className="font-medium text-gray-800 flex items-center gap-1">
                      {order.address.firstName} {order.address.lastName}
                    </p>
                    <div className="text-sm text-gray-600 space-y-2 pl-1 border-l-2 border-rose-100 ml-1">
                      <p>{order.address.streetAddress}</p>
                      <p>
                        {order.address.city}, {order.address.state}
                      </p>
                      <p>
                        {order.address.pinCode}, {order.address.country}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                      <span className="inline-block w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center">
                        <span className="text-xs text-rose-500">☎</span>
                      </span>
                      {order.address.phoneNumber}
                    </p>
                  </div>
                </div>

                {/* Order Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <ShoppingBag className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-gray-800">Order Info</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <p className="flex justify-between items-center">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-medium text-gray-800 bg-amber-50 px-2 py-1 rounded">
                        {order.items.length}
                      </span>
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium text-gray-800">
                        {order.paymentMethod}
                      </span>
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.payment
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {order.payment ? "Paid" : "Pending"}
                      </span>
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-amber-500" /> Date:
                      </span>
                      <span className="font-medium text-gray-800">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </p>
                    <div className="pt-3 mt-3 border-t">
                      <p className="text-xl font-bold text-gray-800 flex items-center justify-between">
                        <span>Total:</span>
                        <span className="text-amber-600">
                          {currency} {order.amount}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <Truck className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold text-gray-800">
                      Order Status
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div
                      className={`w-full h-2 rounded-full bg-gray-100 relative overflow-hidden`}
                    >
                      <div
                        className={`absolute left-0 top-0 h-full ${getStatusColor(
                          order.status
                        )}`}
                        style={{
                          width:
                            order.status === "orderPlaced"
                              ? "20%"
                              : order.status === "Packing"
                              ? "40%"
                              : order.status === "Shipped"
                              ? "60%"
                              : order.status === "Out for delivery"
                              ? "80%"
                              : "100%",
                        }}
                      ></div>
                    </div>
                    <select
                      className="w-full p-3 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                      defaultValue="orderPlaced"
                      value={order.status}
                      onChange={(event) => statusHandler(event, order._id)}
                    >
                      <option value="orderPlaced">Order Placed</option>
                      <option value="Packing">Packing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow flex flex-col items-center justify-center">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">
              New orders will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
