# Sapience JS

## Promises
[Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) are proxied and then handled once the library source is loaded and initialized. As such, _all commands_ will return a `Promise` (or a promise-like object, if still in "proxy-mode") that will execute their respective handlers on resolution. *Please note:* rejection handlers (`.catch` or the second argument of `.then`) will *not* be called by default. This is because thrown errors/rejections are caught internally and sent to the logger.

## Installation
### Library Source
Include the following Javascript before the closing `<head>` tag on all pages you wish to track. It is generally recommended to place this in a common file that all pages on your site include/require.
```js
(function(i, s, o, g, r, a, m) {
  i['SapienceObject'] = r;
  i[r] = i[r] || function() {
    i[r].q = i[r].q || []; var p = {t: [], c: [], f: []}; i[r].q.push({a: arguments, p: p});
    this.then = function() { p.t.push(arguments); return this };
    this.catch = function() { p.c.push(arguments); return this };
    this.finally = function() { p.f.push(arguments); return this };
    return this;
  }
  a = s.createElement(o), m = s.getElementsByTagName(o)[0];
  a.async = 1; a.src = g; m.parentNode.insertBefore(a, m);
})(window, document, 'script', '/sapience.js', 'sapience');
```
As implemented on a web page:
```html
<html>
  <head>
    <script>
      // Include the tracker script from above here...
    </script>
  </head>
</html>
```
### Initialization
Once the library source has been include, you can then initialize the tracker by call the `create` command. We recommend calling this as soon as possible, preferable right after the library source JS is included. For example:
```html
<html>
  <head>
    <script>
      // Include the tracker script from above here...

      // Now create the tracker.
      sapience('create', { id: 'YOUR-TRACKING-ID' });
    </script>
  </head>
</html>
```
### Debug / Logging
In order to obtain detailed logging information, the `logging` command *must* be fired as *the absolute first* command after the library has been included, even before event listeners.
`sapience('logging', { level: 'log' })`;

## Tracker Events
### Subscribing
Events can be listened to by subscribing to them via the `on` command. For example, to listen to user change events, the following command can be executed:
```js
sapience('on', 'user.change', function() {
  // Your code here.
});
```
*Please Note*: All event listeners _must_ be subscribed to _before_ the `init` command is called, otherwise some subscribers may not run properly. For example:
```js
// Register all listeners before `init`.
sapience('on', 'user.change', function() {
  // Your code here.
});
sapience('on', 'tracker.ready', function() {
  // Your code here.
});
// Now that all listeners are subscribed, call `init`.
sapience('init', ...args);
```
Do *NOT* do the following:
```js
sapience('init', ...args);
sapience('on', 'user.change', function() {
  // Your code here.
});
```
While it may appear possible to subscribe to events after `init` is called, callbacks are *NOT* guaranteed to run. This is applicable to `on` commands only. Individual commands can also be handled via their `Promis`, which should be used instead of events when in-line (post-init) callbacks are required. For example, a callback on the `set` user command:
```js
sapience('set', 'user', ...args).then(function() {
  // Code to run on user set (which may also fire the `user.change` event, if properly subscribed and applicable).
});
```
_Note:_ techically speaking, the `on` command will also return a `Promise` - however, the resolve/reject handlers are used to signify success/failure of the _event subscription itself_ and should not be used as the callback for the event.

### Identity/User Handling
