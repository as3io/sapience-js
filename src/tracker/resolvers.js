module.exports = {
  set(key, ...values) {
    if (key === 'user') {
      this.session.setUser(...values);
      return this.session.getUser();
    }
    throw new Error(`No set command found for ${key}`);
  },
};
