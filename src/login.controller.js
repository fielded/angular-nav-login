class LoginController {
  constructor (loginService) {
    this.loginService = loginService
  }

  $routerOnActivate (instruction) {
    return this.loginService.login(instruction)
  }
}

LoginController.$inject = [
  'loginService'
]

export default LoginController
