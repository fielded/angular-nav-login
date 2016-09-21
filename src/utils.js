exports.decodeBase64Url = str => (
  str
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .replace(/\./g, '=')
)

exports.omit = (obj, keys) => Object.keys(obj).reduce((index, key) => {
  if (keys.indexOf(key) === -1) {
    index[key] = obj[key]
  }
  return index
}, {})
