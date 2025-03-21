import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const res = await fetch("http://localhost:8000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        confirmPassword,
        phone,
        location,
        bio,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Registration successful! Please verify your email.");
      navigate("/login");
    } else {
      alert(data.message);
    }
  };

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

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#080710]">
      <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full opacity-50"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-red-500 to-yellow-400 rounded-full opacity-50"></div>

      <div className="relative w-full max-w-md bg-white/10 p-8 rounded-xl backdrop-blur-md shadow-2xl border border-white/20">
        <h3 className="text-white text-3xl font-semibold text-center">
          Реєстрація
        </h3>

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="text-white font-medium block mt-4">Ім'я</label>
          <input
            type="text"
            placeholder="Введіть ім'я"
            className="w-full p-3 bg-white/20 text-white rounded-md border-none focus:ring-2 focus:ring-blue-500 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          <label className="text-white font-medium block mt-4">
            Підтвердьте пароль
          </label>
          <input
            type="password"
            placeholder="Повторіть пароль"
            className="w-full p-3 bg-white/20 text-white rounded-md border-none focus:ring-2 focus:ring-blue-500 outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <label className="text-white font-medium block mt-4">
            Номер телефону (необов'язково)
          </label>
          <input
            type="tel"
            placeholder="Введіть номер телефону"
            className="w-full p-3 bg-white/20 text-white rounded-md border-none focus:ring-2 focus:ring-blue-500 outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label className="text-white font-medium block mt-4">
            Місцезнаходження (необов'язково)
          </label>
          <select
            className="w-full p-3 bg-white/20 text-white rounded-md border-none focus:ring-2 focus:ring-blue-500 outline-none"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Оберіть область</option>
            {ukraineRegions.map((region, index) => (
              <option
                key={index}
                value={region}
                className="bg-gray-800 text-white"
              >
                {region}
              </option>
            ))}
          </select>

          <label className="text-white font-medium block mt-4">
            Про себе (необов'язково)
          </label>
          <textarea
            placeholder="Напишіть кілька слів про себе"
            className="w-full p-3 bg-white/20 text-white rounded-md border-none focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>

          <button className="w-full mt-6 bg-white text-[#080710] font-semibold py-3 rounded-md shadow-lg hover:bg-gray-200 transition">
            Зареєструватися
          </button>
        </form>

        <p className="text-center text-white mt-4">
          Вже є акаунт?{" "}
          <Link to="/login" className="text-blue-400 underline">
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
