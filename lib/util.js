'use strict'

function objectHasValue (obj, value) {
  return Object.values(obj).some(objValue => objValue === value)
}

function getAsArray (value) {
  return value.constructor === Array ? value : [value]
}

function mergeObjects (first, second) {
  return { ...first, ...second }
}

function debugValue (value) {
  console.log(`VALUE: `, value)
  return value
}

module.exports = { objectHasValue, getAsArray, mergeObjects, debugValue }
