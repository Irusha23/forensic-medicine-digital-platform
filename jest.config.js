module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^puppeteer$': '<rootDir>/src/__mocks__/puppeteer.js'
  }
};
