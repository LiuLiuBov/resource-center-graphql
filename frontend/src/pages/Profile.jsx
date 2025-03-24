import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // Get the user ID from the URL

  const [profileUser, setProfileUser] = useState(null);
  const [editPhone, setEditPhone] = useState(false);
  const [editLocation, setEditLocation] = useState(false);
  const [editBio, setEditBio] = useState(false);

  const [newPhone, setNewPhone] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newProfilePicture, setNewProfilePicture] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/auth/user/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProfileUser(data.user);
          setNewPhone(data.user.phone || "");
          setNewLocation(data.user.location || "");
          setNewBio(data.user.bio || "");
          setNewProfilePicture(data.user.profilePicture || "");
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    if (id && id !== user?._id) {
      fetchUserProfile();
    } else {
      setProfileUser(user);
      setNewPhone(user?.phone || "");
      setNewLocation(user?.location || "");
      setNewBio(user?.bio || "");
      setNewProfilePicture(user?.profilePicture || "");
    }
  }, [id, user]);

  const handleSave = async () => {
    const updatedData = {
      phone: newPhone,
      location: newLocation,
      bio: newBio,
      profilePicture: newProfilePicture,
    };

    try {
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
        updateUser(data.user);
        setProfileUser(data.user);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="w-full bg-gradient-to-r from-blue-600 to-blue-400 p-10 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-semibold">Welcome, {profileUser?.name}!</h1>
          <p className="mt-2 text-lg">User Profile</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <img
                src={`http://localhost:5173/${profileUser?.profilePicture}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{profileUser?.name}</h2>
              <p className="text-sm text-gray-400">{profileUser?.email}</p>
              <p
                className={`mt-2 ${
                  profileUser?.role === "admin" ? "text-yellow-400" : "text-green-500"
                }`}
              >
                {profileUser?.role === "admin" ? "Administrator" : "User"}
              </p>
            </div>
          </div>

          {profileUser?._id === user?._id && (
            <>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      <button onClick={handleSave} className="ml-4 bg-green-600 text-white p-2 rounded-md">
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="mt-2">{profileUser?.phone || "No phone number provided"}</p>
                      <button onClick={() => setEditPhone(true)} className="text-blue-500">
                        Edit
                      </button>
                    </div>
                  )}
                </div>

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
                      <button onClick={handleSave} className="ml-4 bg-green-600 text-white p-2 rounded-md">
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="mt-2">{profileUser?.location || "No location provided"}</p>
                      <button onClick={() => setEditLocation(true)} className="text-blue-500">
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="font-medium text-gray-400">Bio</label>
                {editBio ? (
                  <div className="flex items-center">
                    <textarea
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      className="w-full p-2 rounded-md bg-gray-700 text-white h-24"
                    />
                    <button onClick={handleSave} className="ml-4 bg-green-600 text-white p-2 rounded-md">
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="mt-2">{profileUser?.bio || "No bio provided"}</p>
                    <button onClick={() => setEditBio(true)} className="text-blue-500">
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
