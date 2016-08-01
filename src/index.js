import angular from 'angular'

import Login from './login.component'
import LoginService from './login.service'

angular
  .module('angularNavLogin', [])
  .service('loginService', LoginService)
  .component('login', Login)
