const compose = require('stampit');
const Loggable = require('../composables/loggable');
const Emittable = require('../composables/emittable');
const StorageService = require('../services/storage');
const { User } = require('sapience-core').models;

// function eventActions() {
//   const { emitter, storage } = this;
//   const emitChange = ({ user }) => {
//     emitter.emit('user.change', { user });
//   };
//   emitter.on('user.create', emitChange);
//   // @todo determine if user went from anon to identified, and fire event.
//   emitter.on('user.update', emitChange);

//   emitter.on('user.change', ({ user }) => {
//     storage.save('user', user.toString());
//     // Create new session.
//   });
// }

module.exports = compose(Loggable, Emittable, {
  /**
   * Initializes the manager.
   * 1. On init, will determine the current user context from storage.
   * If not found, the initial user will be undefined, and then an anonymous
   * user will be set.
   *
   * 2. Check the query string for a decorated user context, and set if found.
   */
  init() {
    this.storage = StorageService({ logger: this.logger });
    const instances = [
      { name: 'user', options: { suffix: 'u', ttl: 1051200 } },
      { name: 'session', options: { suffix: 's', ttl: 30 } },
    ];
    instances.forEach(({ name, options }) => this.storage.register(name, options));
    // const bindActions = eventActions.bind(this);
    // bindActions();

    this.setInitialState();

    // If no initial user, create anonymous.
    if (!this.user) this.setUser(User.createAnon());

    // Parse the incoming query string, and set
    const fromQuery = User.make(); // @todo Parse query string.
    if (fromQuery.isValid()) this.setUser(fromQuery);
  },
  methods: {
    /**
     *
     * @param {object} usr
     */
    setUser(usr) {
      const user = User(usr);
      if (!user.isValid()) throw new Error('The provided user is invalid');

      // Determine if current user is different than the previous.
      // If a previous user _wasn't_ found, emit the `user.create` event.
      // If a previous user _was_ found, but new user is different, emit the `user.update` event.
      // Both cases will emit the `user.change` event.
      // If the previous and the current users are the same, no events will fire.
      // let event;
      if (!this.user) {
        this.user = user;
        // event = 'user.create';
      } else if (this.user.toString() !== user.toString()) {
        this.user = user;
        // event = 'user.update';
      }
      // if (event) this.emitter.emit(event, { user });
    },

    /**
     *
     */
    getUser() {
      return this.user;
    },

    /**
     *
     */
    setInitialState() {
      let user;
      const fromStorage = User.fromString(this.storage.retrieve('user'));
      if (fromStorage.isValid()) user = fromStorage;
      this.user = user;
    },
  },
});
