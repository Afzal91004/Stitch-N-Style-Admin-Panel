import React from "react";
import { assets } from "../assets/admin_assets/assets.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Header = ({ setToken }) => {
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
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <div className="flex items-center gap-2">
        <img src={assets.logo} alt="Logo" className="h-16" />
      </div>
      <button
        onClick={handleLogout}
        className="bg-gray-700 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;
