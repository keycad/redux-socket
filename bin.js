'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = sockMiddlewareCreator;

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var listeners = {};

function sockMiddlewareCreator(socket) {
	var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	var disconnectedAction = options.disconnectedAction;
	var duplicateAction = options.duplicateAction;
	var debugMode = options.debugMode;

	return function (_ref) {
		var dispatch = _ref.dispatch;

		return function (next) {
			return function (action) {
				if (!action.sock) return next(action);

				if (!socket.connected) {
					if (disconnectedAction) return next(disconnectedAction);
					return console.error('socket is disconnected!');
				}

				var type = action.type;
				var sock = action.sock;

				var rest = _objectWithoutProperties(action, ['type', 'sock']);

				if (type) next(_extends({ type: type }, rest));

				var _ref2 = typeof sock === 'string' ? { path: sock, data: {} } : sock;

				var path = _ref2.path;
				var data = _ref2.data;
				var success = _ref2.success;
				var failure = _ref2.failure;
				var dummy = _ref2.dummy;

				if (listeners[path]) {
					if (duplicateAction) return next(duplicateAction);
					return console.error('A request is already in progress!');
				}

				if (debugMode) console.log('emmiting', path, data);
				var _listeners = listeners[path] = {};

				var removeListeners = function removeListeners() {
					Object.keys(_listeners).forEach(function (prefix) {
						if (debugMode) console.log('removed listener', prefix + path);
						socket.removeListener(prefix + path, _listeners[prefix]);
					});
					delete listeners[path];
				};

				var prepareListener = function prepareListener(prefix, callback) {
					var listener = _listeners[prefix] = function (res) {
						if (debugMode) console.log(prefix + path, 'received', res);
						_.defer(function () {
							return dispatch(_extends({ type: path }, callback(res)));
						});
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
					setTimeout(function () {
						return dispatch({ type: path });
					}, 0);
					delete listeners[path];
				}
			};
		};
	};
}

