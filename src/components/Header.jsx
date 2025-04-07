import React from "react";
import { assets } from "../assets/admin_assets/assets.js";
import { toast } from "react-toastify";
import { HiMenuAlt2 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import "react-toastify/dist/ReactToastify.css";

const Header = ({ setToken, toggleSidebar, isMobile, isSidebarOpen }) => {
  const handleLogout = () => {
    setToken("");
    toast.success("Logged out successfully!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <header className="bg-white text-pink-800 p-4 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img
            src={assets.logo}
            alt="Logo"
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </div>
        <div className="flex">
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="mr-2 hover:bg-pink-50 p-2 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <IoClose size={22} className="text-pink-500" />
              ) : (
                <HiMenuAlt2 size={22} className="text-pink-500" />
              )}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="bg-pink-500 hover:bg-pink-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg font-medium transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3a1 1 0 1 1 2 0v3a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v3a1 1 0 1 1-2 0V4a1 1 0 0 0-1-1H3z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M17.707 10l-4.854 4.854a1 1 0 0 1-1.414-1.414L14.586 10l-3.147-3.146a1 1 0 0 1 1.414-1.414L17.707 10z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden xs:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
