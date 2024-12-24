import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";
import { assets } from "../assets/admin_assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

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

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders Dashboard</h1>
        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          Total Orders: {orders.length}
        </span>
      </div>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="grid md:grid-cols-4 gap-6 p-6">
                {/* Order Items Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <img src={assets.parcel_icon} alt="" className="w-5 h-5" />
                    <h3 className="font-semibold text-gray-800">Order Items</h3>
                  </div>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {item.name} x {item.quantity}
                          </p>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                            {item.size}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="text-gray-600">📍</span>
                    <h3 className="font-semibold text-gray-800">
                      Delivery Address
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-800">
                      {order.address.firstName} {order.address.lastName}
                    </p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{order.address.streetAddress}</p>
                      <p>
                        {order.address.city}, {order.address.state}
                      </p>
                      <p>
                        {order.address.pinCode}, {order.address.country}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      📞 {order.address.phoneNumber}
                    </p>
                  </div>
                </div>

                {/* Order Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="text-gray-600">🛍️</span>
                    <h3 className="font-semibold text-gray-800">Order Info</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-medium">{order.items.length}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">{order.paymentMethod}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.payment
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.payment ? "Paid" : "Pending"}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="font-medium">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-xl font-bold text-gray-800 mt-4">
                      {currency} {order.amount}
                    </p>
                  </div>
                </div>

                {/* Status Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="text-gray-600">📦</span>
                    <h3 className="font-semibold text-gray-800">
                      Order Status
                    </h3>
                  </div>
                  <select
                    className="w-full p-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
