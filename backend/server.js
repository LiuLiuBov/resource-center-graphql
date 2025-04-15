require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const { getUserFromToken } = require("./utils/auth");

async function startServer() {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(morgan("dev"));

  mongoose
    .connect(process.env.MONGO_URI, {})
    .then(() => console.log("✅ MongoDB підключено"))
    .catch((err) => console.error("❌ Помилка підключення до бази:", err));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      const user = await getUserFromToken(token.replace("Bearer ", ""));
      return { user };
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`🚀 GraphQL Server запущено на порту ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer();
