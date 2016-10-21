import angular from 'angular'

import Login from './login.component'
import LoginService from './login.service'
import UserSessionService from './user-session.service'

angular
  .module('angularNavLogin', [])
  .service('loginService', LoginService)
  .service('userSessionService', UserSessionService)
  .component('login', Login)
