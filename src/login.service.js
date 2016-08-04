import { decodeBase64Url } from './utils'

class LoginService {
  constructor (
    $http,
    $window,
    $rootRouter,
    config,
    sessionService,
    toastService,
    mainService
  ) {
    this.$http = $http
    this.$window = $window
    this.$rootRouter = $rootRouter
    this.config = config
    this.sessionService = sessionService
    this.toastService = toastService
    this.mainService = mainService
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
    if (error.message) {
      message += `. The reply was "${error.message}".`
    }
    return this.toastService.error('login-failed', message)
  }

  setSession (session) {
    const doc = Object.assign({}, session, {
      _id: '_local/session'
    })
    const opts = {
      forceUpdate: true
    }
    return this.sessionService.save(doc, opts)
  }

  init (session) {
    this.mainService.init(session)
    this.$rootRouter.navigate(['/Nav'])
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

  getSession () {
    return this.sessionService.get('_local/session')
  }

  canActivate () {
    return this.getSession()
      .then(session => this.init(session))
      .catch(err => this.navLogin(err))
  }

  login (instruction) {
    if (!(instruction.params.username && instruction.params.token)) {
      return this.canActivate()
    }

    const username = decodeURI(instruction.params.username.toLowerCase())
    const token = decodeBase64Url(instruction.params.token)

    return this.loginOrCreateUser(username, token)
      .then(() => this.sessionService.getUser(username))
      .then(session => this.setSession(session))
      .then(session => this.init(session))
      .catch(err => this.handleLoginError(err))
  }

  logout () {
    return this.getSession()
      .then(session => this.sessionService.remove(session))
  }
}

LoginService.$inject = [
  '$http',
  '$window',
  '$rootRouter',
  'config',
  'sessionService',
  'toastService',
  'mainService'
]

export default LoginService
