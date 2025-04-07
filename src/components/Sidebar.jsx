import React from "react";
import { NavLink } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import { GoPackage } from "react-icons/go";
import { FaList } from "react-icons/fa6";

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-pink-500 text-white shadow-md"
        : "text-pink-500 hover:bg-gray-50"
    }`;

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg fixed top-16 left-0 h-[calc(100vh-64px)] transition-all duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isMobile ? "w-64" : "w-64 md:translate-x-0"
        } border-r border-gray-200`}
      >
        <div className="px-3 py-6">
          <div className="space-y-2">
            <NavLink to="/add" className={navLinkClass} onClick={closeSidebar}>
              <div className="bg-gray-100 p-2 rounded-lg">
                <CiCirclePlus size={24} className="text-gray-700" />
              </div>
              <span className="font-medium">Add Items</span>
            </NavLink>

            <NavLink to="/list" className={navLinkClass} onClick={closeSidebar}>
              <div className="bg-gray-100 p-2 rounded-lg">
                <FaList size={22} className="text-gray-700" />
              </div>
              <span className="font-medium">List Items</span>
            </NavLink>

            <NavLink
              to="/orders"
              className={navLinkClass}
              onClick={closeSidebar}
            >
              <div className="bg-gray-100 p-2 rounded-lg">
                <GoPackage size={24} className="text-gray-700" />
              </div>
              <span className="font-medium">Orders</span>
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
