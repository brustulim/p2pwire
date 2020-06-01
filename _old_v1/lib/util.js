function showDebug (prefix = '', value, details = '') {
  // TODO: get debugmode from environment or localstorage config
  const debugMode = true
  if (debugMode) {
    console.log(prefix, value, details)
  }
}

module.exports = { showDebug }
