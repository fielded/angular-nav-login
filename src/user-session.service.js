import { omit } from './utils'

const reservedUserProperties = [
  '_id',
  '_rev',
  'name',
  'password',
  'type',
  'salt',
  'derived_key',
  'password_scheme',
  'iterations'
]

class UserSessionService {
  constructor (
    sessionService
  ) {
    this.sessionService = sessionService
  }

  updateRemoteSession (username, session, diff) {
    const omitted = omit(session, reservedUserProperties)
    const metadata = Object.assign(omitted, diff)

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

  getSession () {
    return this.sessionService.get('_local/session')
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
}

UserSessionService.$inject = [
  'sessionService'
]

export default UserSessionService
