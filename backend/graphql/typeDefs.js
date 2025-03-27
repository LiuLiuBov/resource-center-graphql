const { gql } = require("apollo-server-express");

module.exports = gql`
  # ----- BASIC TYPES -----
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    phone: String
    profilePicture: String
    location: String
    bio: String
    emailVerified: Boolean
  }

  type Request {
    id: ID!
    title: String!
    description: String!
    location: String!
    requester: User!
    status: String!
    volunteers: [User!]!
    createdAt: String
    isActive: Boolean!
  }

  type ChatMessage {
    id: ID!
    request: Request!
    author: User!
    message: String!
    createdAt: String
    updatedAt: String
  }

  # ----- ANALYTICS -----
  type LocationStats {
    _id: String
    count: Int
  }

  type StatusStats {
    status: String
    count: Int
  }

  type AnalyticsPayload {
    totalUsers: Int
    activeRequests: Int
    deactivatedRequests: Int
    locationStats: [LocationStats]
    statusStats: [StatusStats]
  }

  type RequestsPerUser {
    _id: ID!
    count: Int
    userInfo: UserInfoForRequest
  }

  type UserInfoForRequest {
    name: String
    email: String
  }

  # ----- AUTH PAYLOAD -----
  type AuthPayload {
    token: String!
    user: User!
  }

  # ----- REQUEST PAGINATION -----
  type RequestsResponse {
    requests: [Request!]!
    totalRequests: Int!
    currentPage: Int!
    totalPages: Int!
  }

  type StatusStatsResponse {
    activeCount: Int
    inactiveCount: Int
  }

  # ----- QUERIES -----
  type Query {
    # Auth / User
    getUserById(id: ID!): User

    # Requests
    getRequests(
      page: Int
      limit: Int
      location: String
      sort: String
      active: String
      requester: String
    ): RequestsResponse

    getRequestById(id: ID!): Request

    # Chat
    getChatMessages(requestId: ID!): [ChatMessage!]!

    # Analytics (Admins only)
    getAnalytics: AnalyticsPayload
    getRequestsStatus: StatusStatsResponse
    getRequestsLocation: [LocationStats]
    getTotalUsers: Int
    getRequestsPerUser: [RequestsPerUser]
  }

  # ----- MUTATIONS -----
  type Mutation {
    # AUTH
    registerUser(
      name: String!
      email: String!
      password: String!
      confirmPassword: String!
      phone: String
      location: String
      bio: String
    ): String

    loginUser(email: String!, password: String!): AuthPayload
    verifyEmail(token: String!): String
    updateProfile(
      phone: String
      location: String
      bio: String
      profilePicture: String
    ): User

    # REQUESTS
    createRequest(
      title: String!
      description: String!
      location: String!
    ): Request

    updateRequest(
      id: ID!
      title: String
      description: String
      location: String
    ): Request

    deleteRequest(id: ID!): String
    toggleActivation(id: ID!): Request
    acceptRequest(id: ID!): Request
    rejectRequest(id: ID!): Request

    # CHAT
    createChatMessage(
      requestId: ID!
      message: String!
    ): ChatMessage
  }
`;
