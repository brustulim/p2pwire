'use strict'

function objectHasValue (obj, value) {
  return Object.values(obj).some(objValue => objValue === value)
}

module.exports = { objectHasValue }
