module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test files pattern
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.spec.js'
  ],
  
  // Coverage settings
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: [],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true
};
