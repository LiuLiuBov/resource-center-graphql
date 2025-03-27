import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [editPhone, setEditPhone] = useState(false);
  const [editLocation, setEditLocation] = useState(false);
  const [editBio, setEditBio] = useState(false);

  const [newPhone, setNewPhone] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newProfilePicture, setNewProfilePicture] = useState("");

  const GET_USER_PROFILE = `
    query GetUserById($id: ID!) {
      getUserById(id: $id) {
        id
        name
        email
        role
        phone
        location
        bio
        profilePicture
      }
    }
  `;

  const UPDATE_PROFILE = `
    mutation UpdateProfile($phone: String, $location: String, $bio: String, $profilePicture: String) {
      updateProfile(phone: $phone, location: $location, bio: $bio, profilePicture: $profilePicture) {
        id
        name
        email
        role
        phone
        location
        bio
        profilePicture
      }
    }
  `;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = id || user?._id;

        if (!userId) {
          console.error("User ID is not available");
          return;
        }

        const res = await fetch("http://localhost:8000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            query: GET_USER_PROFILE,
            variables: { id: userId },
          }),
        });

        const result = await res.json();
        if (result.errors) {
          console.error("GraphQL error:", result.errors[0].message);
          return;
        }

        const fetchedUser = result.data.getUserById;
        setProfileUser(fetchedUser);
        setNewPhone(fetchedUser.phone || "");
        setNewLocation(fetchedUser.location || "");
        setNewBio(fetchedUser.bio || "");
        setNewProfilePicture(fetchedUser.profilePicture || "");
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, [id, user]);

  const handleSave = async () => {
    const updatedData = {
      phone: newPhone,
      location: newLocation,
      bio: newBio,
      profilePicture: newProfilePicture,
    };

    try {
      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          query: UPDATE_PROFILE,
          variables: updatedData,
        }),
      });

      const result = await res.json();
      if (result.errors) {
        alert(result.errors[0].message);
        return;
      }

      const updatedUser = result.data.updateProfile;
      setEditPhone(false);
      setEditLocation(false);
      setEditBio(false);
      updateUser(updatedUser);
      setProfileUser(updatedUser);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto p-8 mt-16">
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
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                className="w-full p-2 rounded-md bg-gray-700 text-white h-24"
              />
            ) : (
              <p className="mt-2">{profileUser?.bio || "No bio provided"}</p>
            )}
            <button onClick={() => setEditBio(true)} className="text-blue-500 mt-2">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
