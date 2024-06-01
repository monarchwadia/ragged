/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  // Jest 29 doesn't support Prettier 3
  // See docs for more details. https://jestjs.io/docs/configuration/#prettierpath-string
  prettierPath: require.resolve('prettier-2'),
  setupFiles: ["dotenv/config"]
};