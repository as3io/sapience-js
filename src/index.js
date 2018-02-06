const { APP_NAME, WINDOW_VAR_NAME } = require('sapience-core').constants;
const app = require('./app');

// Find the command queue in the `window` object.
// @todo Determine if this should use global/self.
const queueName = window[WINDOW_VAR_NAME];
if (!queueName || !window[queueName]) {
  throw new Error(`No ${APP_NAME} object was found or initialized.
  Was the proper JavaScript included on the page?`);
}
const commandQueue = window[queueName];

// Apply the queue to the app.
const queue = commandQueue.q;
if (Array.isArray(queue)) {
  const map = { t: 'then', c: 'catch', f: 'finally' };
  queue.forEach((proxied) => {
    // Convert the Arguments to an array and extract the command name.
    const args = [...proxied.a];
    const cmd = args.shift();
    // Fire the command and apply/call the proxied promises.
    const promise = app(cmd, ...args);
    proxied.p.forEach(({ a, h }) => promise[map[h]].call(promise, ...a));
  });
}

window[queueName] = app;
