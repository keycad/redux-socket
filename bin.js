'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = sockMiddlewareCreator;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function sockMiddlewareCreator(socket, disconnectedAction, duplicateAction) {
	return function (_ref) {
		var dispatch = _ref.dispatch;

		return function (next) {
			return function (action) {
				if (!action.sock) return next(action);

				if (!socket.connected) {
					// console.log('socket is disconnected!');
					return next(disconnectedAction);
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
					// console.log('A request is already in progress!');
					return next(duplicateAction);
				}

				// console.log('emmiting', path, data);
				var _listeners = listeners[path] = {};

				var removeListeners = function removeListeners() {
					_lodash2['default'].forEach(_listeners, function (listener, prefix) {
						// console.log('remove listener', prefix + path);
						socket.removeListener(prefix + path, listener);
					});

					delete listeners[path];
				};

				var prepareListener = function prepareListener(prefix, callback) {
					var listener = _listeners[prefix] = function (res) {
						// console.log(prefix + path, 'received', res);
						_lodash2['default'].defer(function () {
							return dispatch(_extends({ type: path }, callback(res)));
						});
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
					_lodash2['default'].defer(function () {
						return dispatch({ type: path });
					});
					delete listeners[path];
				}
			};
		};
	};
}

module.exports = exports['default'];
