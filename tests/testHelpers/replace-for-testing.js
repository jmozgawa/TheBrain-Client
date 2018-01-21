module.exports = function replaceImport (originalPath) {
  let enzymePrefix = ''
  if (process.env.ENZYME) {
    enzymePrefix = '/client/src'
  }
  if (originalPath.indexOf('graphql-tools') !== -1) {
    const newPath = originalPath.replace('graphql-tools', `apollo-test-utils-with-context`)
    return newPath
  }
  if (originalPath.indexOf('./networkInterface') !== -1) {
    const newPath = originalPath.replace('./networkInterface', `${process.cwd()}${enzymePrefix}/tests/testHelpers/mockedNetworkInterface`)
    return newPath
  }
  if (originalPath.indexOf('react-intercom') !== -1) {
    return originalPath.replace('react-intercom', `${process.cwd()}${enzymePrefix}/tests/testHelpers/mockedReactComponent`)
  }
  if (originalPath.indexOf('smartlook-client') !== -1) {
    return originalPath.replace('smartlook-client', `${process.cwd()}${enzymePrefix}/tests/testHelpers/mockedObject`)
  }
}
