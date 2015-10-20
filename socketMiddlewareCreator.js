import _ from 'lodash';

const listeners = {};

export default function sockMiddlewareCreator(socket, options = {}) {
	const {disconnectedAction, duplicateAction, debugMode} = options;
	return ({dispatch}) => {
		return (next) => (action) => {
			if (!action.sock) return next(action);

			if (!socket.connected) {
				if (disconnectedAction)
					return next(disconnectedAction);
				return console.error('socket is disconnected!');
			}

			const { type, sock, ...rest } = action;

			if (type) next({type, ...rest});

			const { path, data, success, failure, dummy } =
				typeof sock === 'string' ? { path: sock, data: {} } : sock;

			if (listeners[path]) {
				if (duplicateAction)
					return next(duplicateAction);
				return console.error('A request is already in progress!');
			}

			if (debugMode) console.log('emmiting', path, data);
			const _listeners = listeners[path] = {};

			const removeListeners = () => {
				_.forEach(_listeners, (listener, prefix) => {
					if (debugMode) console.log('removed listener', prefix + path);
					socket.removeListener(prefix + path, listener);
				});

				delete listeners[path];
			};

			const prepareListener = (prefix, callback) => {
				const listener = _listeners[prefix] = res => {
					if (debugMode) console.log(prefix + path, 'received', res);
					_.defer(() => dispatch({type: path, ...callback(res)}));
					removeListeners();
				};
				if (debugMode) console.log('adding listener', prefix + path);
				socket.on(prefix + path, listener);
			};

			if (success) prepareListener('$', success);
			if (failure) prepareListener('€', failure);
			if (!dummy) socket.emit(path, data);

			if (typeof sock === 'string') {
				if (debugMode) console.log(path, 'sock string dispatch');
				_.defer(() => dispatch({type: path}));
				delete listeners[path];
			}
		};
	};
}
