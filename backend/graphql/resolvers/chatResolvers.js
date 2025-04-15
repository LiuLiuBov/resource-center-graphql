const { AuthenticationError, UserInputError, ApolloError } = require("apollo-server-express");

const ChatMessage = require("../../models/chatMessage");

module.exports = {
  Query: {
    async getChatMessages(_, { requestId }, { user }) {
      if (!user) throw new AuthenticationError("Немає доступу");

      const messages = await ChatMessage.find({ request: requestId })
        .populate("author", "_id name email")
        .sort({ createdAt: 1 });

      const validMessages = messages
        .filter((msg) => msg.author && msg.author._id)
        .map((msg) => ({
          ...msg.toObject(),
          id: msg._id.toString(),
          createdAt: msg.createdAt ? new Date(msg.createdAt).toISOString() : null,
          author: {
            id: msg.author._id.toString(),
            name: msg.author.name || "N/A",
            email: msg.author.email || "N/A",
          },
        }));

      return validMessages;
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

      await chatMessage.populate("author", "_id name email");

      return {
        ...chatMessage.toObject(),
        id: chatMessage._id.toString(),
        createdAt: chatMessage.createdAt ? new Date(chatMessage.createdAt).toISOString() : null,
        author: {
          id: chatMessage.author._id.toString(),
          name: chatMessage.author.name || "N/A",
          email: chatMessage.author.email || "N/A",
        },
      };
    },
  },
};
