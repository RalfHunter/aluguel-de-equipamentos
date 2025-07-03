export default  {
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  "coveragePathIgnorePatterns": [
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
    // testMatch:['**/AuthController.test.js']
    // testMatch:['**/AuthService.test.js']
    // testMatch:['**/Usuario.test.js']
    // testMatch:['**/UsuarioController.test.js']
    // testMatch:['**/AuthMiddleware.test.js']]
    // testMatch:['**/usuarioRouter.test.js']
    testMatch:['**/EquipamentoQuerySchema.test.js']


};
