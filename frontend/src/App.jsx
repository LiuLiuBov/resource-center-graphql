import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const App = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({});

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const userLimit = 4;
  const [userTotalPages, setUserTotalPages] = useState(1);

  const GET_ANALYTICS = `
    query GetAnalytics {
      getAnalytics {
        totalUsers
        activeRequests
        deactivatedRequests
        locationStats {
          _id
          count
        }
        statusStats {
          status
          count
        }
      }
    }
  `;

  const GET_MY_REQUESTS = `
    query GetRequests($requester: String, $sort: String, $page: Int, $limit: Int) {
      getRequests(requester: $requester, sort: $sort, page: $page, limit: $limit) {
        requests {
          id
          title
          description
          location
          isActive
          createdAt
        }
        totalRequests
        currentPage
        totalPages
      }
    }
  `;

  const graphQLFetch = async (query, variables = {}) => {
    const res = await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ query, variables }),
    });
    const result = await res.json();
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    return result.data;
  };

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await graphQLFetch(GET_ANALYTICS);
        setStats(data.getAnalytics);
      } catch (err) {
        console.error("GraphQL Error (Analytics):", err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchMyRequests = async () => {
      setLoading(true);
      try {
        const data = await graphQLFetch(GET_MY_REQUESTS, {
          requester: user.id,
          sort: "desc",
          page: userPage,
          limit: userLimit,
        });

        const { requests, totalPages } = data.getRequests;
        setRequests(requests);
        setUserTotalPages(totalPages);
      } catch (err) {
        console.error("GraphQL Error (Requests):", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user.role === "admin") {
      fetchAnalytics();
    } else {
      fetchMyRequests();
    }
  }, [user, userPage]);

  const COLORS = ["#8884d8", "#82ca9d", "#ff7300", "#d0ed57", "#a4de6c", "#8dd1e1"];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="w-full bg-gradient-to-r from-blue-600 to-blue-400 p-10 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold">
            {user?.role === "admin" ? "Admin Dashboard" : "My Created Requests"}
          </h1>
        </div>
      </div>

      <div className="pt-16 pb-8 px-8">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : user?.role === "admin" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Total Users</h2>
                <p className="text-4xl">{stats.totalUsers}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Active Requests</h2>
                <p className="text-4xl">{stats.activeRequests}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Deactivated Requests</h2>
                <p className="text-4xl">{stats.deactivatedRequests}</p>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-2xl font-bold mb-4">Requests by Location</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.locationStats} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-2xl font-bold mb-4">Requests Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={stats.statusStats} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100}>
                      {stats.statusStats?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <>
            {requests.length === 0 ? (
              <p className="text-gray-400">No created requests found.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requests.map((request) => (
                    <Link key={request.id} to={`/requests/${request.id}`}>
                      <div className="bg-gray-800 p-6 rounded-lg shadow hover:bg-gray-700 transition">
                        <h2 className="text-xl font-semibold mb-2">{request.title}</h2>
                        <p className="text-gray-300 mb-2">{request.description}</p>
                        <p className="text-gray-400 mb-2">Location: {request.location}</p>
                        <p className="text-gray-400 mb-2">
                          {request.isActive ? "Active" : "Deactivated"}
                        </p>
                        <p className="text-gray-500">
                          Created at:{" "}
                          {request.createdAt ? new Date(request.createdAt).toLocaleString() : "N/A"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="flex justify-center space-x-4 mt-8">
                  <button
                    disabled={userPage === 1}
                    onClick={() => setUserPage((prev) => prev - 1)}
                    className={`px-4 py-2 rounded-md ${
                      userPage === 1 ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-gray-800 rounded-md">
                    Page {userPage} of {userTotalPages}
                  </span>
                  <button
                    disabled={userPage === userTotalPages}
                    onClick={() => setUserPage((prev) => prev + 1)}
                    className={`px-4 py-2 rounded-md ${
                      userPage === userTotalPages
                        ? "bg-gray-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
