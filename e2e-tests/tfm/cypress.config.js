const { defineConfig } = require('cypress');

module.exports = defineConfig({
  dealApiProtocol: 'http://',
  dealApiHost: 'localhost',
  dealApiPort: '5001',
  centralApiProtocol: 'http://',
  centralApiHost: 'localhost',
  centralApiPort: '5005',
  tfmApiProtocol: 'http://',
  tfmApiHost: 'localhost',
  tfmApiPort: '5004',
  referenceDataApiProtocol: 'http://',
  referenceDataApiHost: 'localhost',
  referenceDataApiPort: '5002',
  // TODO: Read value from environment variable
  apiKey: 'test',
  responseTimeout: 100000,
  pageLoadTimeout: 120000,
  redirectionLimit: 100,
  numTestsKeptInMemory: 1,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'http://localhost:5003',
    specPattern: 'cypress/e2e/**/*.spec.js',
  },
  experimentalCspAllowList: ['child-src', 'default-src', 'frame-src', 'form-action', 'script-src', 'script-src-elem'],
});
