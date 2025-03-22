import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const RequestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch the individual request
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : request ? (
          <div className="bg-gray-800 rounded-lg shadow p-6">
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
            <p className="mb-2">Author: {request.requester?.name || "N/A"}</p>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">Request not found.</p>
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
