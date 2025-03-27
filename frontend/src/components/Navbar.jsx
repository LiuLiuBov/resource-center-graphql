import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-700 dark:text-blue-500"
      : "text-gray-900 dark:text-white";

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const res = await fetch("http://localhost:8000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            query: GET_USER_PROFILE,
            variables: { id: user?._id },
          }),
        });

        const result = await res.json();
        if (result.errors) {
          console.error("GraphQL Error:", result.errors[0].message);
          return;
        }

        const fetchedUser = result.data.getUserById;
        if (fetchedUser) {
          updateUser(fetchedUser);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, [user, updateUser]);

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        
        <Link to="/" className="flex items-center space-x-3">
          <img src="/volunteer.svg" className="h-8" alt="Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            Volunteer!
          </span>
        </Link>

        <button
          onClick={toggleMenu}
          data-collapse-toggle="navbar-sticky"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-sticky"
          aria-expanded={menuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        <div
          className={`${
            menuOpen ? "block" : "hidden"
          } w-full md:flex md:w-auto md:order-1`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <Link
                to="/"
                className={`block py-2 px-3 rounded-md hover:bg-gray-100 md:hover:bg-transparent ${isActive(
                  "/"
                )} dark:hover:bg-gray-700`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/requests"
                className={`block py-2 px-3 rounded-md hover:bg-gray-100 md:hover:bg-transparent ${isActive(
                  "/requests"
                )} dark:hover:bg-gray-700`}
              >
                Requests
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  to={`/profile/${user.id}`}
                  className={`block py-2 px-3 rounded-md hover:bg-gray-100 md:hover:bg-transparent ${isActive(
                    `/profile/${user.id}`
                  )} dark:hover:bg-gray-700`}
                >
                  Profile
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="flex md:order-2 space-x-3">
          {user ? (
            <button
              onClick={logout}
              className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md">
                Login
              </Link>
              <Link to="/register" className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
