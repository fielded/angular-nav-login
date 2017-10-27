import { decodeBase64Url } from './utils'

class LoginService {
  constructor (
    $http,
    $window,
    config,
    sessionService,
    toastService,
    mainService,
    userSessionService
  ) {
    this.$http = $http
    this.$window = $window
    this.config = config
    this.sessionService = sessionService
    this.toastService = toastService
    this.mainService = mainService
    this.userSessionService = userSessionService
  }

  createUser (username, token) {
    const data = {
      username,
      token
    }
    const opts = {
      headers: {
        'x-api-key': this.config.middleware.key
      }
    }
    return this.$http.post(this.config.middleware.url + '/users', data, opts)
  }

  handleLoginError (error) {
    let message = 'Could not log you in'
    if (error && error.data && error.data.message) {
      message += `. The response was "${error.data.message}".`
    }
    return this.toastService.error('login-failed', message)
  }

  init (session) {
    this.mainService.init(session)
    return session
  }

  navLogin () {
    this.$window.location.href = this.config.nav + '/SignIn.aspx'
  }

  navLogout () {
    this.$window.location.href = this.config.nav + '/SignOut.aspx'
  }

  loginOrCreateUser (username, token) {
    const retry = () => {
      return this.createUser(username, token)
        .then(() => this.sessionService.login(username, token))
    }
    return this.sessionService.login(username, token)
      .catch(retry)
  }

  canActivate () {
    const isValidSession = (local, remote) => {
      if (!remote.ok) {
        return Promise.reject('session invalid')
      }
      if (!(remote.userCtx && remote.userCtx.name)) {
        return Promise.reject('missing user context in remote session')
      }
      if (!local.userName) {
        return Promise.reject('missing user name in local session')
      }
      if (remote.userCtx.name.toLowerCase() !== local.userName.toLowerCase()) {
        return Promise.reject(`session mismatch for user ${local.userName}`)
      }
    }

    const checkSession = localSession => {
      return this.sessionService.getSession()
        .then(remoteSession => isValidSession(localSession, remoteSession))
        .then(() => this.init(localSession))
        .catch(err => {
          if (!this.$window.navigator.onLine) {
            // User looks to be offline, grant login
            return this.init(localSession)
          }
          throw err
        })
    }

    return this.userSessionService.getSession()
      .then(localSession => checkSession(localSession))
      .catch(err => this.navLogin(err))
  }

  login (instruction) {
    if (!(instruction.params.username && instruction.params.token)) {
      return this.canActivate()
    }

    const username = this.$window.decodeURI(instruction.params.username)
      .toLowerCase()
    const token = decodeBase64Url(instruction.params.token)

    const diff = {
      lastLogin: new Date().toISOString()
    }

    return this.loginOrCreateUser(username, token)
      .then(() => this.sessionService.getUser(username))
      .then(session => this.userSessionService
        .updateRemoteSession(username, session, diff))
      .then(session => this.userSessionService.setSession(session))
      .then(session => this.init(session))
      .catch(err => this.handleLoginError(err))
  }

  logout () {
    return this.userSessionService.getSession()
      .then(session => this.sessionService.remove(session))
  }
}

LoginService.$inject = [
  '$http',
  '$window',
  'config',
  'sessionService',
  'toastService',
  'mainService',
  'userSessionService'
]

export default LoginService
