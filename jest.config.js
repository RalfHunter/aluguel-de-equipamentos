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
    // testMatch:['**/UsuarioService.test.js']
    // testMatch:['**/UsuarioRepository.test.js']
    // testMatch:['**/GrupoFilterBuilder.test.js']
    testMatch:['**/UsuarioRepository.test.js']
    // testMatch:['**/AuthMiddleware.test.js']
    // testMatch:['**/usuarioRoutes.test.js']
    // testMatch:['**/authRoutes.test.js']
    // testMatch:['**/GrupoController.test.js']
    // testMatch:['**/GrupoService.test.js']
    // testMatch:['**/GrupoRepository.test.js']
    // testMatch:['**/grupoRoutes.test.js']
    // testMatch:['**/UsuarioSchema.test.js']

};
