// graphql/resolvers/requestResolvers.js
const { AuthenticationError, ApolloError } = require("apollo-server-express");

// Mongoose models
const User = require("../../models/User");
const Request = require("../../models/Request");

module.exports = {
  Query: {
    async getRequests(_, args, { user }) {
      const {
        page = 1,
        limit = 4,
        location = "",
        sort = "desc",
        active,
        requester,
      } = args;
    
      const query = {
        ...(location && { location: { $regex: location, $options: "i" } }),
        ...(active === "true" && { isActive: true }),
        ...(active === "false" && { isActive: false }),
        ...(requester && { requester }),
      };
    
      const sortOrder = sort === "asc" ? 1 : -1;
    
      try {
        const requests = await Request.find(query)
          .populate("requester", "name email")
          .populate("volunteers", "name email profilePicture")
          .sort({ createdAt: sortOrder })
          .skip((page - 1) * limit)
          .limit(limit);
    
        // Format the response and map _id to id
        const formattedRequests = requests.map((request) => {
          const plainRequest = request.toObject(); // Convert Mongoose Document to plain object
          return {
            ...plainRequest,
            id: plainRequest._id.toString(), // Convert ObjectId to string
            createdAt: new Date(plainRequest.createdAt).toISOString(), // Ensure proper date formatting
          };
        });
    
        const totalRequests = await Request.countDocuments(query);
    
        return {
          requests: formattedRequests,
          totalRequests,
          currentPage: page,
          totalPages: Math.ceil(totalRequests / limit),
        };
      } catch (error) {
        throw new Error(`Failed to fetch requests: ${error.message}`);
      }
    },
    
    

    async getRequestById(_, { id }) {
      const requestItem = await Request.findById(id)
        .populate("requester", "name email")
        .populate("volunteers", "name email profilePicture role");
      if (!requestItem) {
        throw new ApolloError("Request not found", "REQUEST_NOT_FOUND");
      }
      return requestItem;
    },
  },

  Mutation: {
    async createRequest(_, { title, description, location }, { user }) {
      if (!user) throw new AuthenticationError("Немає доступу");
    
      try {
        const request = new Request({
          title,
          description,
          location,
          requester: user.id,
        });
    
        await request.save();
    
        const populatedRequest = await Request.findById(request.id).populate("requester", "name email role");
    
        return populatedRequest;
      } catch (err) {
        throw new ApolloError("Помилка створення запиту: " + err.message);
      }
    },    

    async updateRequest(_, { id, title, description, location }, { user }) {
      if (!user) throw new AuthenticationError("Немає доступу");

      const updateFields = {};
      if (title !== undefined) updateFields.title = title;
      if (description !== undefined) updateFields.description = description;
      if (location !== undefined) updateFields.location = location;

      const updatedRequest = await Request.findByIdAndUpdate(id, updateFields, {
        new: true,
      }).populate("requester", "name email");

      if (!updatedRequest) {
        throw new ApolloError("Request not found");
      }

      return updatedRequest;
    },

    async deleteRequest(_, { id }, { user }) {
      if (!user) throw new AuthenticationError("Немає доступу");
      // Optional: check if user is the owner or admin

      const request = await Request.findByIdAndDelete(id);
      if (!request) {
        throw new ApolloError("Request not found or already deleted");
      }

      return "Запит видалено";
    },

    async toggleActivation(_, { id }, { user }) {
      if (!user) throw new AuthenticationError("Немає доступу");

      let request = await Request.findById(id);
      if (!request) {
        throw new ApolloError("Запит не знайдено");
      }

      request.isActive = !request.isActive;
      await request.save();

      request = await Request.findById(id).populate("requester", "name email");
      return request;
    },

    async acceptRequest(_, { id }, { user }) {
      if (!user) throw new AuthenticationError("Немає доступу");

      let request = await Request.findById(id).populate("requester", "name email");
      if (!request) {
        throw new ApolloError("Request not found");
      }

      // Restrict request owner or admin from volunteering on the same request
      if (String(request.requester._id) === String(user.id) || user.role === "admin") {
        throw new ApolloError("Requester or Admin cannot accept the request");
      }

      // Check if already a volunteer
      if (request.volunteers.includes(user.id)) {
        throw new ApolloError("User has already accepted this request");
      }

      request.volunteers.push(user.id);
      await request.save();

      request = await Request.findById(id)
        .populate("requester", "name email")
        .populate("volunteers", "name email profilePicture role");

      return request;
    },

    async rejectRequest(_, { id }, { user }) {
      if (!user) throw new AuthenticationError("Немає доступу");

      let request = await Request.findById(id).populate("requester", "name email");
      if (!request) {
        throw new ApolloError("Request not found");
      }

      request.volunteers = request.volunteers.filter(
        (volunteerId) => String(volunteerId) !== String(user.id)
      );
      await request.save();

      request = await Request.findById(id).populate("requester", "name email");
      return request;
    },
  },
};
