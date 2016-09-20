import {
  omit,
  decodeBase64Url
} from './utils'

const reservedUserProperties = [
  '_id',
  '_rev',
  'name',
  'password',
  'roles',
  'type',
  'salt',
  'derived_key',
  'password_scheme',
  'iterations'
]

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
    if (error && error.data && error.data.message) {
      message += `. The response was "${error.data.message}".`
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

  updateSession (username, session) {
    const omitted = omit(session, reservedUserProperties)
    const metadata = Object.assign(omitted, {
      lastLogin: new Date().toISOString()
    })

    const updateIdRev = res => {
      if (!res.ok) {
        return session
      }
      return Object.assign(metadata, omit(res, ['ok']))
    }

    const opts = {
      metadata
    }
    return this.sessionService.putUser(username, opts)
      .then(updateIdRev)
  }

  login (instruction) {
    if (!(instruction.params.username && instruction.params.token)) {
      return this.canActivate()
    }

    const username = this.$window.decodeURI(instruction.params.username)
      .toLowerCase()
    const token = decodeBase64Url(instruction.params.token)

    return this.loginOrCreateUser(username, token)
      .then(() => this.sessionService.getUser(username))
      .then(session => this.updateSession(username, session))
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
