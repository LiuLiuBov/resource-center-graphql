// graphql/resolvers/chatResolvers.js
const { AuthenticationError, UserInputError, ApolloError } = require("apollo-server-express");

// Mongoose models
const ChatMessage = require("../../models/chatMessage");

module.exports = {
  Query: {
    async getChatMessages(_, { requestId }, { user }) {
      if (!user) throw new AuthenticationError("Немає доступу");

      const messages = await ChatMessage.find({ request: requestId })
        .populate("author", "name email")
        .sort({ createdAt: 1 });
      return messages;
    },
  },

  Mutation: {
    async createChatMessage(_, { requestId, message }, { user }) {
      if (!user) throw new AuthenticationError("Немає доступу");

      if (!message) {
        throw new UserInputError("Message content is required");
      }

      const chatMessage = new ChatMessage({
        request: requestId,
        author: user.id,
        message,
      });
      await chatMessage.save();

      // Populate author for immediate return
      await chatMessage.populate("author", "name email");
      return chatMessage;
    },
  },
};
