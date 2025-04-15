const _ = require("lodash");

const authResolvers = require("./authResolvers");
const requestResolvers = require("./requestResolvers");
const chatResolvers = require("./chatResolvers");
const analyticsResolvers = require("./analyticsResolvers");

const resolvers = _.merge(
  {},
  authResolvers,
  requestResolvers,
  chatResolvers,
  analyticsResolvers
);

module.exports = resolvers;
