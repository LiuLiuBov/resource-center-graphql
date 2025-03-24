import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import axios from "axios";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const App = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      const fetchStats = async () => {
        try {
          const response = await axios.get("http://localhost:8000/api/analytics", {
            headers: { Authorization: `Bearer ${user?.token}` },
          });
          setStats(response.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching stats:", err);
        }
      };
      fetchStats();
    } else {
      const fetchRequests = async () => {
        try {
          const response = await axios.get("http://localhost:8000/api/requests?location=&sort=desc", {
            headers: { Authorization: `Bearer ${user?.token}` },
          });
          setRequests(response.data.requests);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching requests:", err);
        }
      };
      fetchRequests();
    }
  }, [user]);

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((request) => (
                  <Link key={request._id} to={`/requests/${request._id}`}>
                    <div className="bg-gray-800 p-6 rounded-lg shadow hover:bg-gray-700 transition">
                      <h2 className="text-xl font-semibold mb-2">{request.title}</h2>
                      <p className="text-gray-300 mb-2">{request.description}</p>
                      <p className="text-gray-400 mb-2">Location: {request.location}</p>
                      <p className="text-gray-400 mb-2">Status: {request.isActive ? "Active" : "Deactivated"}</p>
                      <p className="text-gray-500">Created at: {new Date(request.createdAt).toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
