require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const chatRoutes = require("./routes/chatRoutes"); 
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log("✅ MongoDB підключено"))
  .catch(err => console.error("❌ Помилка підключення до бази:", err));

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/requests/:id/chat", chatRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Сервер запущено на порту ${PORT}`));
