// graphql/resolvers/analyticsResolvers.js
const { AuthenticationError } = require("apollo-server-express");
const User = require("../../models/User");
const Request = require("../../models/Request");

// Helper for checking admin role
function checkAdmin(user) {
  if (!user || user.role !== "admin") {
    throw new AuthenticationError("Доступ заборонено. Необхідні права адміністратора.");
  }
}

module.exports = {
  Query: {
    async getAnalytics(_, __, { user }) {
      checkAdmin(user);

      const totalUsers = await User.countDocuments();
      const activeRequests = await Request.countDocuments({ isActive: true });
      const deactivatedRequests = await Request.countDocuments({ isActive: false });

      const locationStats = await Request.aggregate([
        { $group: { _id: "$location", count: { $sum: 1 } } },
      ]);

      const statusStats = [
        { status: "Active", count: activeRequests },
        { status: "Deactivated", count: deactivatedRequests },
      ];

      return {
        totalUsers,
        activeRequests,
        deactivatedRequests,
        locationStats,
        statusStats,
      };
    },

    async getRequestsStatus(_, __, { user }) {
      checkAdmin(user);

      const activeCount = await Request.countDocuments({ isActive: true });
      const inactiveCount = await Request.countDocuments({ isActive: false });

      return { activeCount, inactiveCount };
    },

    async getRequestsLocation(_, __, { user }) {
      checkAdmin(user);

      const requestsByLocation = await Request.aggregate([
        { $group: { _id: "$location", count: { $sum: 1 } } },
      ]);
      return requestsByLocation;
    },

    async getTotalUsers(_, __, { user }) {
      checkAdmin(user);
      return User.countDocuments();
    },

    async getRequestsPerUser(_, __, { user }) {
      checkAdmin(user);

      const requestsPerUser = await Request.aggregate([
        { $group: { _id: "$requester", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            count: 1,
            "userInfo.name": 1,
            "userInfo.email": 1,
          },
        },
      ]);

      return requestsPerUser;
    },
  },
};
