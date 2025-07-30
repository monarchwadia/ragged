// Only run integration tests if RUN_TEST_TYPE is set to 'integration'
// Otherwise, run only unit tests
const testType = process.env.RUN_TEST_TYPE;
let testMatch;
if (testType === 'integration') {
  testMatch = ['**/*.integration.test.ts'];
} else {
  // Default to unit tests
  testMatch = ['**/*.test.ts', '!**/*.integration.test.ts'];
}

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // verbose: true,
  // Jest 29 doesn't support Prettier 3
  // See docs for more details. https://jestjs.io/docs/configuration/#prettierpath-string
  prettierPath: require.resolve('prettier-2'),
  setupFiles: ["dotenv/config"],
  testMatch,
};