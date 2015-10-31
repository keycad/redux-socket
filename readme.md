# Redux-socket
a [redux](https://github.com/rackt/redux) middleware that allows you to trigger a socket request on the client-side and dispatch an action in response. For it's server-side counterpart, check out [redux-socket-create-listeners](https://github.com/quirinpa/redux-socket-create-listeners).

If you want to trigger redux-socket, add a property named "sock" to your action, like this:

```js
export function login(username, password) {
	return {
		sock: {
			path: 'login',
			data: { username, password },
			// the following are the actionCreators that get
			// fired when the server issues a response,
			success: authSuccess,
			failure: notify,
		},
	};
}
```

If a 'type' parameter isn't specified by the response actionCreators (success and failure), the sock's path (in this case 'login') will be assigned.
This way you can use a single isomorphic reducer to keep your redux store state in session, for example, as well as on the client side. For more information about this, check out [redux-socket-create-listeners](https://github.com/quirinpa/redux-socket-create-listeners).

To initlialize the middleware, you'll need to have already created the socket and to pass it as an argument, like so:
```js
const sockMiddleware = sockMiddlewareCreator(
	socket, disconnectedAction, duplicateAction);
```
DisconnectedAction and duplicateAction are actions to be dispatched in case the socket is disconnected, or a listener is already active on that socket. These are optional so if you leave them blank it'll just log to the console.

## Installation

```
npm install -S redux-socket
```

## Example usage
[createMiddleware](https://github.com/quirinpa/2Post/blob/master/src/client/redux-create/middleware/index.js)
[Actions](https://github.com/quirinpa/2Post/blob/master/src/dux/user.js)
