import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import { GoPackage } from "react-icons/go";
import { FaList } from "react-icons/fa6";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-pink-500 text-white shadow-md"
        : "text-pink-500 hover:bg-gray-50"
    }`;

  return (
    <div
      className={`bg-white shadow-lg h-[calc(100vh-64px)] transition-all duration-300 fixed top-24 left-0 z-40 ${
        collapsed ? "w-20" : "w-64"
      } border-r border-gray-200`}
    >
      <div className="flex justify-end p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          {collapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="px-3 py-6">
        <div className="space-y-2">
          <NavLink to="/add" className={navLinkClass}>
            <div className="bg-gray-100 p-2 rounded-lg">
              <CiCirclePlus size={24} className="text-gray-700" />
            </div>
            {!collapsed && <span className="font-medium">Add Items</span>}
          </NavLink>

          <NavLink to="/list" className={navLinkClass}>
            <div className="bg-gray-100 p-2 rounded-lg">
              <FaList size={22} className="text-gray-700" />
            </div>
            {!collapsed && <span className="font-medium">List Items</span>}
          </NavLink>

          <NavLink to="/orders" className={navLinkClass}>
            <div className="bg-gray-100 p-2 rounded-lg">
              <GoPackage size={24} className="text-gray-700" />
            </div>
            {!collapsed && <span className="font-medium">Orders</span>}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
