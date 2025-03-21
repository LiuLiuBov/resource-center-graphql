import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("data:", data)
    if (res.ok) {
      const { token, user } = data;

      login(token, user); 
      navigate("/"); 
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full bg-[#080710]">

      <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full opacity-50"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-red-500 to-yellow-400 rounded-full opacity-50"></div>

      <div className="relative w-full max-w-md bg-white/10 p-8 rounded-xl backdrop-blur-md shadow-2xl border border-white/20">
        <h3 className="text-white text-3xl font-semibold text-center">Увійти</h3>

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="text-white font-medium block mt-4">Email</label>
          <input
            type="email"
            placeholder="Введіть email"
            className="w-full p-3 bg-white/20 text-white rounded-md border-none focus:ring-2 focus:ring-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="text-white font-medium block mt-4">Пароль</label>
          <input
            type="password"
            placeholder="Введіть пароль"
            className="w-full p-3 bg-white/20 text-white rounded-md border-none focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full mt-6 bg-white text-[#080710] font-semibold py-3 rounded-md shadow-lg hover:bg-gray-200 transition">
            Увійти
          </button>
        </form>

        {/* <div className="flex justify-center space-x-4 mt-6">
          <button className="w-1/2 py-2 bg-white/20 text-white rounded-md flex items-center justify-center hover:bg-white/30 transition">
            <i className="fab fa-google mr-2"></i> Google
          </button>
          <button className="w-1/2 py-2 bg-white/20 text-white rounded-md flex items-center justify-center hover:bg-white/30 transition">
            <i className="fab fa-facebook mr-2"></i> Facebook
          </button>
        </div> */}

        <p className="text-center text-white mt-4">
          Немає акаунта?{" "}
          <Link to="/register" className="text-blue-400 underline">
            Зареєструватися
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
