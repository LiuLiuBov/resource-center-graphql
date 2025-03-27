// graphql/resolvers/index.js
const _ = require("lodash");

// Import the resolvers
const authResolvers = require("./authResolvers");
const requestResolvers = require("./requestResolvers");
const chatResolvers = require("./chatResolvers");
const analyticsResolvers = require("./analyticsResolvers");

// Merge them into a single resolver object
const resolvers = _.merge(
  {},
  authResolvers,
  requestResolvers,
  chatResolvers,
  analyticsResolvers
);

module.exports = resolvers;
