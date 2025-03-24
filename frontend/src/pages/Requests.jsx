import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Requests = () => {
  const { user } = useAuth();

  const [activeRequests, setActiveRequests] = useState([]);
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [activeTotalPages, setActiveTotalPages] = useState(1);
  const activeLimit = 2;

  const [deactivatedRequests, setDeactivatedRequests] = useState([]);
  const [deactivatedCurrentPage, setDeactivatedCurrentPage] = useState(1);
  const [deactivatedTotalPages, setDeactivatedTotalPages] = useState(1);
  const deactivatedLimit = 2;

  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchActiveRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/requests?page=${activeCurrentPage}&limit=${activeLimit}&location=${locationFilter}&sort=${sortOrder}&active=true`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      console.log("Active API Response:", response.data);
      setActiveRequests(
        Array.isArray(response.data.requests) ? response.data.requests : []
      );
      setActiveTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error loading active requests:", err);
      setActiveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeactivatedRequests = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/requests?page=${deactivatedCurrentPage}&limit=${deactivatedLimit}&location=${locationFilter}&sort=${sortOrder}&active=false`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      console.log("Deactivated API Response:", response.data);
      setDeactivatedRequests(
        Array.isArray(response.data.requests) ? response.data.requests : []
      );
      setDeactivatedTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error loading deactivated requests:", err);
      setDeactivatedRequests([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActiveRequests();
      const intervalId = setInterval(fetchActiveRequests, 60000);
      return () => clearInterval(intervalId);
    }
  }, [user, activeCurrentPage, locationFilter, sortOrder]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchDeactivatedRequests();
      const intervalId = setInterval(fetchDeactivatedRequests, 60000);
      return () => clearInterval(intervalId);
    }
  }, [user, deactivatedCurrentPage, locationFilter, sortOrder]);

  const handleLocationChange = (e) => {
    setLocationFilter(e.target.value);
    setActiveCurrentPage(1);
    setDeactivatedCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setActiveCurrentPage(1);
    setDeactivatedCurrentPage(1);
  };

  const handleActivePreviousPage = () => {
    if (activeCurrentPage > 1) setActiveCurrentPage(activeCurrentPage - 1);
  };

  const handleActiveNextPage = () => {
    if (activeCurrentPage < activeTotalPages)
      setActiveCurrentPage(activeCurrentPage + 1);
  };

  const handleDeactivatedPreviousPage = () => {
    if (deactivatedCurrentPage > 1)
      setDeactivatedCurrentPage(deactivatedCurrentPage - 1);
  };

  const handleDeactivatedNextPage = () => {
    if (deactivatedCurrentPage < deactivatedTotalPages)
      setDeactivatedCurrentPage(deactivatedCurrentPage + 1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="w-full bg-gradient-to-r from-blue-600 to-blue-400 p-10 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold">Active Requests</h1>
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
        ) : activeRequests.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            No active requests found.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRequests.map((req) => (
                <Link to={`/requests/${req._id}`} key={req._id}>
                  <div className="bg-gray-800 rounded-lg shadow p-6 hover:bg-gray-700 transition">
                    <h2 className="text-xl font-semibold mb-2">{req.title}</h2>
                    <p className="text-gray-300 mb-2">{req.description}</p>
                    <p className="text-gray-400 mb-2">
                      Location: {req.location}
                    </p>
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

            <div className="flex justify-center space-x-4 mt-8">
              <button
                disabled={activeCurrentPage === 1}
                onClick={handleActivePreviousPage}
                className={`px-4 py-2 rounded-md ${
                  activeCurrentPage === 1
                    ? "bg-gray-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-gray-800 rounded-md">
                Page {activeCurrentPage} of {activeTotalPages}
              </span>
              <button
                disabled={activeCurrentPage === activeTotalPages}
                onClick={handleActiveNextPage}
                className={`px-4 py-2 rounded-md ${
                  activeCurrentPage === activeTotalPages
                    ? "bg-gray-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}

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

      {user?.role === "admin" && (
          <div className="mt-16">
            <div className="w-full bg-gradient-to-r from-blue-600 to-blue-400 p-10 mt-16">
              <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-3xl font-bold">Deactivated Requests</h1>
              </div>
            </div>


<div className="container mx-auto px-4 py-20">
            {deactivatedRequests.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">
                No deactivated requests found.
              </p>
            ) : (
              <>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deactivatedRequests.map((req) => (
                    <Link to={`/requests/${req._id}`} key={req._id}>
                      <div className="bg-gray-800 rounded-lg shadow p-6 hover:bg-gray-700 transition">
                        <h2 className="text-xl font-semibold mb-2">
                          {req.title}
                        </h2>
                        <p className="text-gray-300 mb-2">{req.description}</p>
                        <p className="text-gray-400 mb-2">
                          Location: {req.location}
                        </p>
                        <p className="text-gray-400 mb-2">
                          Status:{" "}
                          {req.status === "accepted"
                            ? "Accepted"
                            : "Not Accepted"}
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

                <div className="flex justify-center space-x-4 mt-8">
                  <button
                    disabled={deactivatedCurrentPage === 1}
                    onClick={handleDeactivatedPreviousPage}
                    className={`px-4 py-2 rounded-md ${
                      deactivatedCurrentPage === 1
                        ? "bg-gray-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-gray-800 rounded-md">
                    Page {deactivatedCurrentPage} of {deactivatedTotalPages}
                  </span>
                  <button
                    disabled={deactivatedCurrentPage === deactivatedTotalPages}
                    onClick={handleDeactivatedNextPage}
                    className={`px-4 py-2 rounded-md ${
                      deactivatedCurrentPage === deactivatedTotalPages
                        ? "bg-gray-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        )}

    </div>
  );
};

export default Requests;
