const ProxyTracker = require('./tracker/proxy');
const { DEFAULT_TRACKER_NAME } = require('sapience-core').constants;

/**
 * All named, registered tracker proxies.
 */
const proxies = {};

/**
 * Creates a Tracker instance, and runs the tracker command result.
 *
 * @param {string} cmd The command name.
 * @param {...array} args The command arguments.
 * @return {Promise}
 */
module.exports = (cmd, ...args) => {
  // Determine the tracker name and command.
  const parts = String(cmd).split('.', 2);
  const name = (parts.length === 2) ? parts[0] || DEFAULT_TRACKER_NAME : DEFAULT_TRACKER_NAME;
  const command = (parts.length === 2) ? parts[1] : parts[0];

  if (!proxies[name]) {
    proxies[name] = ProxyTracker({ name });
  }
  const proxy = proxies[name];
  return proxy.execute(command, args);
};
