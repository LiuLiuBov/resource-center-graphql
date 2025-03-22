import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 4;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/requests?page=${currentPage}&limit=${limit}&location=${locationFilter}&sort=${sortOrder}&active=true`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      console.log("API Response:", response.data);
      setRequests(
        Array.isArray(response.data.requests) ? response.data.requests : []
      );
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error loading requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (user) {
      fetchRequests();

      const intervalId = setInterval(() => {
        fetchRequests();
      }, 60000);

      return () => clearInterval(intervalId);
    }
  }, [user, currentPage, locationFilter, sortOrder]);

  const handleLocationChange = (e) => {
    setLocationFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="w-full bg-gradient-to-r from-blue-600 to-blue-400 p-10 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold">All Active Requests</h1>
        </div>
      </div>

      <div className="w-full bg-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <label htmlFor="location" className="block text-gray-300 mb-2">
            Filter by Location:
          </label>
          <input
            type="text"
            id="location"
            placeholder="Enter location"
            value={locationFilter}
            onChange={handleLocationChange}
            className="p-2 w-full bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <label htmlFor="sort" className="block text-gray-300 mb-2">
            Sort by Date:
          </label>
          <select
            id="sort"
            value={sortOrder}
            onChange={handleSortChange}
            className="p-2 w-full bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No requests found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((req) => (
              <Link to={`/requests/${req._id}`} key={req._id}>
                <div className="bg-gray-800 rounded-lg shadow p-6 hover:bg-gray-700 transition">
                  <h2 className="text-xl font-semibold mb-2">{req.title}</h2>
                  <p className="text-gray-300 mb-2">{req.description}</p>
                  <p className="text-gray-400 mb-2">Location: {req.location}</p>
                  <p className="text-gray-400 mb-2">
                    Status:{" "}
                    {req.status === "accepted" ? "Accepted" : "Not Accepted"}
                  </p>
                  <p className="text-gray-500 mb-2">
                    Created at: {new Date(req.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    Author: {req.requester?.name || "N/A"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center space-x-4 mt-8">
          <button
            disabled={currentPage === 1}
            onClick={handlePreviousPage}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? "bg-gray-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-gray-800 rounded-md">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={handleNextPage}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>

        {user?.role !== "admin" && (
          <Link
            to="/requests/create"
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 flex items-center justify-center text-3xl rounded-full shadow-lg transition-all"
            title="Create New Request"
          >
            +
          </Link>
        )}
      </div>
    </div>
  );
};

export default Requests;
