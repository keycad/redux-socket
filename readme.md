# Redux-socket
a [redux](https://github.com/rackt/redux) middleware that allows you to trigger a socket request and dispatch an action in response.

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
This way you can use a single isomorphic reducer to keep your redux store state in session as well as on the client side, for example. For more information about this, check out [redux-socket-create-listeners](https://github.com/quirinpa/redux-socket-create-listeners).

## Installation

```
npm install -S redux-socket
```
