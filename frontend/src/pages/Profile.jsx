import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [editPhone, setEditPhone] = useState(false);
  const [editLocation, setEditLocation] = useState(false);
  const [editBio, setEditBio] = useState(false);

  const [newPhone, setNewPhone] = useState(user?.phone || "");
  const [newLocation, setNewLocation] = useState(user?.location || "");
  const [newBio, setNewBio] = useState(user?.bio || "");
  const [newProfilePicture, setNewProfilePicture] = useState(user?.profilePicture || "");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSave = async (field) => {
    const updatedData = {
      phone: newPhone,
      location: newLocation,
      bio: newBio,
      profilePicture: newProfilePicture,
    };
  
    const res = await fetch("http://localhost:8000/api/auth/update-profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify(updatedData),
    });
  
    const data = await res.json();
  
    if (res.ok) {
  
      setEditPhone(false);
      setEditLocation(false);
      setEditBio(false);
  
      updateUser(updatedData); 
    } else {
      alert(data.message);
    }
  };  
  

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar Above the Profile */}
      <Navbar />

      {/* Profile Header */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-blue-400 p-10 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-semibold">Welcome, {user?.name}!</h1>
          <p className="mt-2 text-lg">Your profile information is below</p>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* User Information Card */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4">
            {/* Profile Picture */}
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <img
                src={`http://localhost:5173/${user?.profilePicture}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              {/* Name, Email, and Role */}
              <h2 className="text-2xl font-semibold">{user?.name}</h2>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <p
                className={`mt-2 ${
                  user?.role === "admin" ? "text-yellow-400" : "text-green-500"
                }`}
              >
                {user?.role === "admin" ? "Administrator" : "User"}
              </p>
            </div>
          </div>

          {/* Additional Profile Information */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Phone Field */}
            <div className="flex flex-col">
              <label className="font-medium text-gray-400">Phone</label>
              {editPhone ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-700 text-white"
                  />
                  <button
                    onClick={() => handleSave("phone")}
                    className="ml-4 bg-green-600 text-white p-2 rounded-md"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="mt-2">{user?.phone || "No phone number provided"}</p>
                  <button
                    onClick={() => setEditPhone(true)}
                    className="text-blue-500"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Location Field */}
            <div className="flex flex-col">
              <label className="font-medium text-gray-400">Location</label>
              {editLocation ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-700 text-white"
                  />
                  <button
                    onClick={() => handleSave("location")}
                    className="ml-4 bg-green-600 text-white p-2 rounded-md"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="mt-2">{user?.location || "No location provided"}</p>
                  <button
                    onClick={() => setEditLocation(true)}
                    className="text-blue-500"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bio Field */}
          <div className="mt-6 col-span-2">
            <label className="font-medium text-gray-400">Bio</label>
            {editBio ? (
              <div className="flex items-center">
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-700 text-white h-24"
                />
                <button
                  onClick={() => handleSave("bio")}
                  className="ml-4 bg-green-600 text-white p-2 rounded-md"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="mt-2">{user?.bio || "No bio provided"}</p>
                <button
                  onClick={() => setEditBio(true)}
                  className="text-blue-500"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
