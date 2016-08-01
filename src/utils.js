exports.decodeBase64Url = str => (
  str
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .replace(/\./g, '=')
)
