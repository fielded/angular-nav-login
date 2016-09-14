(function (angular) {
  'use strict';

  angular = 'default' in angular ? angular['default'] : angular;

  function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports), module.exports; }

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var LoginController = function () {
    function LoginController(loginService) {
      classCallCheck(this, LoginController);

      this.loginService = loginService;
    }

    createClass(LoginController, [{
      key: '$routerOnActivate',
      value: function $routerOnActivate(instruction) {
        return this.loginService.login(instruction);
      }
    }]);
    return LoginController;
  }();

  LoginController.$inject = ['loginService'];

  var LoginComponent = {
    controller: LoginController
  };

  var utils = __commonjs(function (module, exports) {
  exports.decodeBase64Url = function (str) {
    return str.replace(/-/g, '+').replace(/_/g, '/').replace(/\./g, '=');
  };
  });

  var decodeBase64Url = utils.decodeBase64Url;

  var LoginService = function () {
    function LoginService($http, $window, $rootRouter, config, sessionService, toastService, mainService) {
      classCallCheck(this, LoginService);

      this.$http = $http;
      this.$window = $window;
      this.$rootRouter = $rootRouter;
      this.config = config;
      this.sessionService = sessionService;
      this.toastService = toastService;
      this.mainService = mainService;
    }

    createClass(LoginService, [{
      key: 'createUser',
      value: function createUser(username, token) {
        var data = {
          username: username,
          token: token
        };
        var opts = {
          headers: {
            'x-api-key': this.config.middleware.key
          }
        };
        return this.$http.post(this.config.middleware.url + '/users', data, opts);
      }
    }, {
      key: 'handleLoginError',
      value: function handleLoginError(error) {
        var message = 'Could not log you in';
        if (error && error.data && error.data.message) {
          message += '. The reply was "' + error.data.message + '".';
        }
        return this.toastService.error('login-failed', message);
      }
    }, {
      key: 'setSession',
      value: function setSession(session) {
        var doc = Object.assign({}, session, {
          _id: '_local/session'
        });
        var opts = {
          forceUpdate: true
        };
        return this.sessionService.save(doc, opts);
      }
    }, {
      key: 'init',
      value: function init(session) {
        this.mainService.init(session);
        this.$rootRouter.navigate(['/Nav']);
        return session;
      }
    }, {
      key: 'navLogin',
      value: function navLogin() {
        this.$window.location.href = this.config.nav + '/SignIn.aspx';
      }
    }, {
      key: 'navLogout',
      value: function navLogout() {
        this.$window.location.href = this.config.nav + '/SignOut.aspx';
      }
    }, {
      key: 'loginOrCreateUser',
      value: function loginOrCreateUser(username, token) {
        var _this = this;

        var retry = function retry() {
          return _this.createUser(username, token).then(function () {
            return _this.sessionService.login(username, token);
          });
        };
        return this.sessionService.login(username, token).catch(retry);
      }
    }, {
      key: 'getSession',
      value: function getSession() {
        return this.sessionService.get('_local/session');
      }
    }, {
      key: 'canActivate',
      value: function canActivate() {
        var _this2 = this;

        return this.getSession().then(function (session) {
          return _this2.init(session);
        }).catch(function (err) {
          return _this2.navLogin(err);
        });
      }
    }, {
      key: 'login',
      value: function login(instruction) {
        var _this3 = this;

        if (!(instruction.params.username && instruction.params.token)) {
          return this.canActivate();
        }

        var username = this.$window.decodeURI(instruction.params.username).toLowerCase();
        var token = decodeBase64Url(instruction.params.token);

        return this.loginOrCreateUser(username, token).then(function () {
          return _this3.sessionService.getUser(username);
        }).then(function (session) {
          return _this3.setSession(session);
        }).then(function (session) {
          return _this3.init(session);
        }).catch(function (err) {
          return _this3.handleLoginError(err);
        });
      }
    }, {
      key: 'logout',
      value: function logout() {
        var _this4 = this;

        return this.getSession().then(function (session) {
          return _this4.sessionService.remove(session);
        });
      }
    }]);
    return LoginService;
  }();

  LoginService.$inject = ['$http', '$window', '$rootRouter', 'config', 'sessionService', 'toastService', 'mainService'];

  angular.module('angularNavLogin', []).service('loginService', LoginService).component('login', LoginComponent);

}(angular));