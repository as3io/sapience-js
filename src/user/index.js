const compose = require('stampit');
const Loggable = require('../composables/loggable');
const Emittable = require('../composables/emittable');
const StorageService = require('../services/storage');
const { User } = require('sapience-core').models;

/**
 * @todo This is a manager service, not a model.
 * @todo Need to determine if this is a "user" or "session" manager.
 */
module.exports = compose(Loggable, Emittable, {
  /**
   * Initializes the manager.
   * On init, will determine the current user context using the following flow:
   * 1. Search for a user in storage, if found:
   *    - Signifies that a user previously visited.
   *    - Set the initial context to the storage value.
   *    - Set the current context to the storage value.
   * 2. Determine if a user was sent in the manager init, if found:
   *    - Set the current context to the init value.
   * 3. Check the query string for a decorated user context, if found:
   *    - Set the current context to the decorated value.
   * 4. Finally, determine if the user context has changed
   *    - Each phases needs to push/pop the previous context, so that comparison is done properly
   *
   * @param {object} params
   * @param {(object|string|array)} [params.usr] The passed user context on initialization.
   */
  init({ usr }) {
    this.storage = StorageService({ logger: this.logger });
    const instances = [
      { name: 'user', options: { suffix: 'u', ttl: 1051200 } },
      { name: 'session', options: { suffix: 's', ttl: 30 } },
    ];
    instances.forEach(({ name, options }) => this.storage.register(name, options));

    // Bind user event actions.
    this.bindEventActions();

    // Emit user events.
    this.emitEvents(usr);
  },
  methods: {
    bindEventActions() {
      const emitChange = ({ previous, current }) => {
        this.emitter.emit('user.change', { previous, current });
      };
      this.emitter.on('user.create', emitChange);
      this.emitter.on('user.update', emitChange); // @todo determine if user went from anon to identified, and fire event.
      this.emitter.on('user.change', ({ current }) => {
        this.storage.save('user', current.toString());
      });
      this.emitter.on('user.refresh', () => {
        this.storage.refresh('user');
      });
    },
    emitEvents(usr) {
      // Determine if current user is different than the previous.
      // If a previous user _wasn't_ found, emit the `user.created` event.
      // If a previous user _was_ found, but new user is different, emit the `user.updated` event.
      // Both cases will emit the `user.changed` event.
      // If the previous and the current users are the same, no events will fire.
      const { previous, current } = this.getUserState(usr);
      // @todo Clone the user args
      if (!previous) {
        this.emitter.emit('user.create', { previous, current });
      } else if (previous.toString() !== current.toString()) {
        this.emitter.emit('user.update', { previous, current });
      } else {
        this.emitter.emit('user.refresh', { current });
      }
    },
    getUsers(usr) {
      return {
        fromStorage: User.fromString(this.storage.retrieve('user')),
        fromInit: User(usr),
        fromQuery: User.make(), // @todo Parse query string.
      };
    },
    getUserState(usr) {
      const user = this.getUsers(usr);
      const state = {
        previous: undefined,
        current: undefined,
      };

      if (user.fromStorage.isValid()) {
        state.previous = user.fromStorage;
        state.current = user.fromStorage;
      }
      if (user.fromInit.isValid()) {
        state.current = user.fromInit;
      }
      if (user.fromQuery.isValid()) {
        state.current = user.fromQuery;
      }
      if (!state.current) {
        state.current = User.createAnon();
      }
      return state;
    },
  },
});
