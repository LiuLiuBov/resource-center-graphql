import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const ukraineRegions = [
  "Vinnytsia Oblast",
  "Volyn Oblast",
  "Dnipropetrovsk Oblast",
  "Donetsk Oblast",
  "Zhytomyr Oblast",
  "Zakarpattia Oblast",
  "Zaporizhzhia Oblast",
  "Ivano-Frankivsk Oblast",
  "Kyiv Oblast",
  "Kirovohrad Oblast",
  "Luhansk Oblast",
  "Lviv Oblast",
  "Mykolaiv Oblast",
  "Odesa Oblast",
  "Poltava Oblast",
  "Rivne Oblast",
  "Sumy Oblast",
  "Ternopil Oblast",
  "Kharkiv Oblast",
  "Kherson Oblast",
  "Khmelnytskyi Oblast",
  "Cherkasy Oblast",
  "Chernivtsi Oblast",
  "Chernihiv Oblast",
];

const RequestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8000/api/requests/${id}`,
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );
        setRequest(response.data);
        setEditTitle(response.data.title);
        setEditDescription(response.data.description);
        setEditLocation(response.data.location);
      } catch (err) {
        console.error("Error loading request:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRequest();
    }
  }, [id, user]);

  const fetchChatMessages = async () => {
    setChatLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/requests/${id}/chat`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setMessages(response.data.messages);
    } catch (err) {
      console.error("Error loading chat messages:", err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/requests/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setRequest(response.data.request);
      alert("Request accepted successfully!");
    } catch (err) {
      console.error("Error accepting request:", err);
      alert(err.response?.data?.message || "Error accepting request");
    }
  };

  const isVolunteer = request?.volunteers?.some(volunteer => String(volunteer._id) === String(user?._id));

  const handleRejectRequest = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/requests/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setRequest(response.data.request);
      alert("Request rejected successfully!");
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert(err.response?.data?.message || "Error rejecting request");
    }
  };
  

  useEffect(() => {
    if (user) {
      fetchChatMessages();
      const intervalId = setInterval(fetchChatMessages, 60000);
      return () => clearInterval(intervalId);
    }
  }, [user, id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await axios.post(
        `http://localhost:8000/api/requests/${id}/chat`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setNewMessage("");
      fetchChatMessages();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:8000/api/requests/${id}`,
        {
          title: editTitle,
          description: editDescription,
          location: editLocation,
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setRequest(response.data);
      setEditing(false);
    } catch (err) {
      console.error("Error updating request:", err);
    }
  };

  const handleToggleActivation = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/requests/${id}/toggle-activation`,
        {},
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setRequest(response.data.request);
    } catch (err) {
      console.error("Error toggling activation:", err);
    }
  };

  const handleDeleteRequest = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this request?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:8000/api/requests/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      navigate("/requests");
    } catch (err) {
      console.error("Error deleting request:", err);
    }
  };

  const isCreator =
    request &&
    request.requester &&
    String(request.requester._id) === String(user?.id || user?._id);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : request ? (
          <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
            {editing ? (
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block mb-1">Title:</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded-md focus:outline-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Description:</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded-md focus:outline-none"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Location:</label>
                  <select
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded-md focus:outline-none"
                  >
                    <option value="">Select a region</option>
                    {ukraineRegions.map((region, index) => (
                      <option key={index} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-4">{request.title}</h1>
                <p className="mb-2">{request.description}</p>
                <p className="mb-2">Location: {request.location}</p>
                <p className="mb-2">
                  Status:{" "}
                  {request.status === "accepted" ? "Accepted" : "Not Accepted"}
                </p>
                <p className="mb-2">
                  Created at: {new Date(request.createdAt).toLocaleString()}
                </p>
                <p className="mb-2">
                  Author: {request.requester?.name || "N/A"}
                </p>
                {isCreator && (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
                    >
                      Edit Request
                    </button>
                    <button
                      onClick={handleDeleteRequest}
                      className="mt-4 ml-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
                    >
                      Delete Request
                    </button>
                  </>
                )}

{!isCreator && !isAdmin && (
  <>
    {!isVolunteer ? (
      <button
        onClick={handleAcceptRequest}
        className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md"
      >
        Accept Request
      </button>
    ) : (
      <button
        onClick={handleRejectRequest}
        className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
      >
        Reject Request
      </button>
    )}
  </>
)}


                {isAdmin && (
                  <button
                    onClick={handleToggleActivation}
                    className={`mt-4 px-4 py-2 rounded-md text-white font-semibold transition-colors duration-300 ${
                      request.isActive
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {request.isActive
                      ? "Deactivate Request"
                      : "Activate Request"}
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">Request not found.</p>
        )}

{request && request.volunteers && request.volunteers.length > 0 ? (
  <div className="mt-8">
    <h2 className="text-2xl font-bold mb-4">Accepted Volunteers</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {request.volunteers.map((volunteer, index) => (
        <div
          key={index}
          className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition"
        >
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <img
                src={`http://localhost:5173/${volunteer.profilePicture}`}
                alt="Volunteer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{volunteer.name || "Unknown"}</h2>
              <p className="text-sm text-gray-400">{volunteer.email || "No email provided"}</p>
              <p
                className={`mt-2 ${
                  volunteer.role === "admin" ? "text-yellow-400" : "text-green-500"
                }`}
              >
                {volunteer.role === "admin" ? "Administrator" : "User"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
) : (
  <p className="text-gray-400">No volunteers have accepted this request yet.</p>
)}





        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Chat</h2>
          <div className="bg-gray-700 p-4 rounded h-64 overflow-y-auto">
            {chatLoading ? (
              <p className="text-gray-300">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-gray-300">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className="mb-4 border-b border-gray-600 pb-2"
                >
                  <p className="text-sm text-gray-400">
                    {request &&
                    request.requester &&
                    String(msg.author?._id) ===
                      String(request.requester._id) ? (
                      <>
                        <strong className="bg-yellow-300 text-gray-900 px-1">
                          {msg.author?.name || "Unknown"}
                        </strong>
                        {" (Author of the request) - "}
                      </>
                    ) : (
                      <>
                        <strong>{msg.author?.name || "Unknown"}</strong>
                        {" - "}
                      </>
                    )}
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                  <p>{msg.message}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="mt-4 flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-[600px] p-2 bg-gray-600 text-white rounded-md focus:outline-none"
            />
            <button
              type="submit"
              className="ml-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
