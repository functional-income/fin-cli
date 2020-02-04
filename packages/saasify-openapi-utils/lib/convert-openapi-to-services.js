'use strict'

/**
 * Converts an OpenAPI spec to Saasify's `Service` format.
 *
 * @param {object} openapi - OpenAPI spec.
 * @param {object} config - Parsed Saasify project configuration.
 *
 * @return {Promise}
 */
module.exports = async (openapi, config) => {
  const origServices = config.services.slice()
  const services = []

  // TODO: clean up this hacky service resolution stuffs
  const isSingleService = origServices.length === 1
  const firstService = origServices[0]
  let origService = firstService

  // TODO: convert openapi path to service path syntax so we can use
  // https://github.com/pillarjs/path-to-regexp for routing
  // {pathParam} to :pathParam
  // TODO: is this transformation necessary?

  for (const path of Object.keys(openapi.paths)) {
    const pathItem = openapi.paths[path]
    const name = path.slice(1)

    if (!isSingleService) {
      let index = origServices.findIndex((s) => s.path === path)
      if (
        index < 0 &&
        origServices.length === 1 &&
        origServices[0].path === undefined
      ) {
        index = 0
      }

      if (index >= 0) {
        origService = origServices.splice(index, 1)[0]
      } else {
        origService = null
      }
    }

    const service = {
      name,
      path,
      src: firstService.src,
      ...origService
    }

    service.GET = false
    service.POST = false

    const httpMethods = Object.keys(pathItem)
    for (const httpMethod of httpMethods) {
      service[httpMethod.toUpperCase()] = true
    }

    services.push(service)
  }

  return services
}