'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _redux = require('redux');

var _orm = require('./orm');

var _orm2 = _interopRequireDefault(_orm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Setup Redux Store
var initialState = _immutable2.default.fromJS({
  entities: {
    shot: {
      1234: {
        id: '1234',
        foo: 'bar'
      },
      2345: {
        id: '2345',
        foo: 'bar'
      },
      3456: {
        id: '3456',
        foo: 'baz'
      }
    }
  },
  entityOrder: {
    shot: ['2345', '3456', '1234']
  },
  pagination: {
    shot: {
      previous_page: null,
      next_page: 2,
      current_page: 1,
      total_pages: 3,
      total_count: 111,
      count: 50
    }
  }
});

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    default:
      return state;
  }
}
var store = (0, _redux.createStore)(reducer);

function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text: text
  };
}

_orm2.default.Config.database = store;

// Setup Shot Class

var Shot = function (_ORM$Base) {
  _inherits(Shot, _ORM$Base);

  function Shot() {
    _classCallCheck(this, Shot);

    return _possibleConstructorReturn(this, (Shot.__proto__ || Object.getPrototypeOf(Shot)).apply(this, arguments));
  }

  _createClass(Shot, [{
    key: 'valid',
    value: function valid() {
      return !!this.projectId;
    }
  }, {
    key: 'onCreate',
    value: function onCreate(shot, attributes) {
      console.log('Call shot creation API', attributes);
    }
  }, {
    key: 'onSave',
    value: function onSave(shot) {
      console.log('Call shot save API', shot);
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(shot, attributes) {
      console.log('Call shot update API', attributes);
    }
  }, {
    key: 'onDestroy',
    value: function onDestroy(shot) {
      console.log('Call shot destroy API', shot);
    }
  }]);

  return Shot;
}(_orm2.default.Base);

var shot = void 0;
var shots = void 0;
var order = void 0;
var pagination = void 0;

// Tests

console.log('\x1b[36m%s\x1b[0m', 'TESTING CREATE');
shot = Shot.create({ hammer: 'time ' });
console.log('shot: ', shot, '\n');

console.log('\x1b[36m%s\x1b[0m', 'TESTING ALL');
shots = Shot.all();
console.log('shot: ', shots, '\n');

console.log('\x1b[36m%s\x1b[0m', 'TESTING ORDER');
order = Shot.order();
console.log('order:', order, '\n');

console.log('\x1b[36m%s\x1b[0m', 'TESTING ORDER IMMUTABLE');
order = Shot.order(true);
console.log('order:', order, '\n');

console.log('\x1b[36m%s\x1b[0m', 'TESTING ORDERED');
shots = Shot.ordered();
console.log('shot: ', shots, '\n');

console.log('\x1b[36m%s\x1b[0m', 'TESTING PAGINATION');
pagination = Shot.pagination();
console.log('pagination: ', pagination, '\n');

console.log('\x1b[36m%s\x1b[0m', 'TESTING PAGINATION IMMUTABLE');
pagination = Shot.pagination(true);
console.log('pagination: ', pagination, '\n');

console.log('\x1b[36m%s\x1b[0m', 'TESTING FIND');
shot = Shot.find(1234);
console.log('shot: ', shot, '\n');

console.log('\x1b[36m%s\x1b[0m', 'TESTING WHERE');
shots = Shot.where({ foo: 'bar' });
console.log('shots: ', shots, '\n');

console.log('\x1b[36m%s\x1b[0m', 'TESTING DOT ACCESS');
shot = Shot.find(1234);
console.log('shot.foo: ', shot.foo, '\n');

console.log('\x1b[36m%s\x1b[0m', 'TESTING CHANGED');
shot = Shot.find(1234);
shot.foo = 'baz';
console.log('shot.foo: ', shot.foo);
console.log('shot.changes: ', shot.changes(), '\n');

console.log('\x1b[36m%s\x1b[0m', 'TESTING UPDATE');
shot = Shot.find(1234);
shot.update({ foo: 'slack' });
console.log('shot.foo: ', shot.foo, '\n');

console.log('\x1b[36m%s\x1b[0m', 'TESTING SAVE');
shot = Shot.find(1234);
var saved = shot.save();
console.log('shot.save', saved, '\n');
shot.projectId = '42';
saved = shot.save();
console.log('shot.save', saved, '\n');

console.log('\x1b[36m%s\x1b[0m', 'TESTING LISTENER');
shot = Shot.find(1234);
shot.mattress = 'heavy';
store.dispatch(addTodo('foo'));
console.log('dirty: ', shot);

console.log('\x1b[36m%s\x1b[0m', 'TESTING DESTROY');
shot = Shot.find(1234);
shot.destroy();