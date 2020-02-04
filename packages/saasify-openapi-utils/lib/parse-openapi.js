'use strict'

const cloneDeep = require('clone-deep')
const isUrl = require('is-url-superb')
const parser = require('swagger-parser')
const semver = require('semver')

const { validators } = require('saasify-faas-utils')

const httpMethodBlacklist = [
  'put',
  'delete',
  'options',
  'head',
  'patch',
  'trace'
]

const httpMethodWhitelist = ['get', 'post']

const httpParameterBlacklist = new Set(['path', 'cookie'])

/**
 * Validates and parses an OpenAPI spec according to Saasify's constraints.
 *
 * Returns a potentially updated, deep cloned spec that should be used.
 *
 * @param {object} spec - OpenAPI spec.
 *
 * @return {Promise}
 */
module.exports = async (spec, opts = {}) => {
  const { strict = false } = opts

  const bundle = await parser.bundle(spec)
  const api = await parser.dereference(cloneDeep(spec))

  if (semver.major(api.openapi) !== 3) {
    throw new Error('Only OpenAPI version 3 is supported')
  }

  if (strict) {
    if (!api.servers || !api.servers.length) {
      throw new Error('Missing required "servers"')
    }

    for (const server of api.servers) {
      if (!server.url || !isUrl(server.url)) {
        throw new Error('Missing required server "url"')
      }
    }
  }

  for (const path of Object.keys(api.paths)) {
    const pathItem = api.paths[path]

    if (path[0] !== '/') {
      throw new Error(`Invalid path "${path}" must start with "/"`)
    }

    // TODO: account for path parameters
    if (!validators.servicePath(path)) {
      throw new Error(
        `Invalid path "${path}" must be blank or a valid JS variable identifier`
      )
    }

    for (const httpMethod of httpMethodBlacklist) {
      const op = pathItem[httpMethod]
      if (op !== undefined) {
        throw new Error(
          `Unsupported http method "${httpMethod}" for path "${path}"`
        )
      }
    }

    let httpMethodFound = false
    for (const httpMethod of httpMethodWhitelist) {
      const op = pathItem[httpMethod]

      if (op !== undefined) {
        httpMethodFound = true
        await module.exports.validateOperation(op, pathItem)
      }
    }

    if (!httpMethodFound) {
      throw new Error(
        `Path "${path}" must contain one of the following http methods [${httpMethodWhitelist.join(
          ', '
        )}]`
      )
    }

    if (pathItem.parameters) {
      await module.exports.validateParameters(pathItem.parameters)
    }
  }

  return bundle
}

module.exports.validateOperation = async (op, pathItem) => {
  if (op.parameters) {
    await module.exports.validateParameters(op.parameters)
  }

  if (op.servers !== undefined) {
    throw new Error(`"Operation.servers" is not allowed`)
  }
}

module.exports.validateParameters = async (parameters) => {
  for (const param of parameters) {
    if (httpParameterBlacklist.has(param.in)) {
      throw new Error(
        `Unsupported http parameter location "${param.in}" for parameter "${param.name}"`
      )
    }
  }
}