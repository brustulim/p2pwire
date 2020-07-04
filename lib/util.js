"use strict";

function showDebug(prefix = "", value, details = "") {
  // TODO: get debugmode from environment or localstorage config
  const debugMode = true;
  if (debugMode) {
    console.log(prefix, value, details);
  }
}

function objectHasValue(obj, value) {
  return Object.values(obj).some((objValue) => objValue === value);
}

module.exports = { showDebug, objectHasValue };
