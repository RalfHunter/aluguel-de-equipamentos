module.exports = {
  testEnvironment: 'node',
  transform: {
    "^.+\\.js$": ["babel-jest", {
      "presets": [["@babel/preset-env", { "targets": { "node": "current" } }]]
    }]
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/utils/helpers/index.js",
    "/utils/logger.js",
    "/utils/errors",
    "/utils/helpers/errorHandler.js",
    "/utils/helpers/StatusService.js",
    "/utils/helpers/messages.js",
    "/utils/helpers/CommonResponse.js",
    "utils/helpers/CustomError.js",
    "utils/helpers/HttpStatusCodes.js"
  ],
  testMatch: ['**/UsuarioController.test.js'],
  moduleFileExtensions: ['js', 'json'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/**/*.test.js'
  ]
};
