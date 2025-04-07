import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { Route, Routes, Navigate } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Login from "./components/Login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "₹";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize on mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (token === "") {
    return (
      <>
        <Login setToken={setToken} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        setToken={setToken}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex relative">
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          isMobile={isMobile}
        />
        <div
          className={`flex-1 p-4 sm:p-6 transition-all duration-300 mt-16 ${
            isMobile ? "ml-0" : isSidebarOpen ? "md:ml-64" : "ml-0"
          }`}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/add" replace />} />
            <Route path="/add" element={<Add token={token} />} />
            <Route path="/list" element={<List token={token} />} />
            <Route path="/orders" element={<Orders token={token} />} />
          </Routes>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default App;
