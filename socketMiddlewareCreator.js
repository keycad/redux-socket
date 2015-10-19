import _ from 'lodash';

export default function sockMiddlewareCreator(socket, disconnectedAction, duplicateAction) {
	return ({dispatch}) => {
		return (next) => (action) => {
			if (!action.sock) return next(action);

			if (!socket.connected) {
				// console.log('socket is disconnected!');
				return next(disconnectedAction);
			}

			const { type, sock, ...rest } = action;

			if (type) next({type, ...rest});

			const { path, data, success, failure, dummy } =
				typeof sock === 'string' ? { path: sock, data: {} } : sock;

			if (listeners[path]) {
				// console.log('A request is already in progress!');
				return next(duplicateAction);
			}

			// console.log('emmiting', path, data);
			const _listeners = listeners[path] = {};

			const removeListeners = () => {
				_.forEach(_listeners, (listener, prefix) => {
					// console.log('remove listener', prefix + path);
					socket.removeListener(prefix + path, listener);
				});

				delete listeners[path];
			};

			const prepareListener = (prefix, callback) => {
				const listener = _listeners[prefix] = res => {
					// console.log(prefix + path, 'received', res);
					_.defer(() => dispatch({type: path, ...callback(res)}));
					removeListeners();
				};
				// console.log('adding listener', prefix + path);
				socket.on(prefix + path, listener);
			};

			if (success) prepareListener('$', success);
			if (failure) prepareListener('€', failure);
			if (!dummy) socket.emit(path, data);

			if (typeof sock === 'string') {
				// console.log(path, 'sock string dispatch');
				_.defer(() => dispatch({type: path}));
				delete listeners[path];
			}
		};
	};
}
