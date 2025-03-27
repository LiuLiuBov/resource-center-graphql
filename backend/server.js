require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

// Імпорт вашої схеми та резольверів
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

// Функція, що отримує користувача з токена (аналог вашого authMiddleware)
const { getUserFromToken } = require("./utils/auth");

async function startServer() {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(morgan("dev"));

  // Підключення до MongoDB
  mongoose
    .connect(process.env.MONGO_URI, {})
    .then(() => console.log("✅ MongoDB підключено"))
    .catch((err) => console.error("❌ Помилка підключення до бази:", err));

  // Створення екземпляра Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      // Дістаємо токен з заголовка Authorization
      // Формат: "Bearer <токен>"
      const token = req.headers.authorization || "";
      const user = await getUserFromToken(token.replace("Bearer ", ""));
      // Повертаємо user в контекст — він буде доступний у всіх резольверах
      return { user };
    },
  });

  // Запускаємо ApolloServer перед тим, як підключити до Express
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`🚀 GraphQL Server запущено на порту ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer();
