export default  {
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  "coveragePathIgnorePatterns": [
      "/node_modules/",
      "/src/utils/helpers/index.js",
      "/utils/logger.js",
      "utils/helpers/HttpStatusCodes.js"
    ],
    // testMatch:['**/AuthController.test.js', '**/AuthService.test.js', '**/authRoutes.test.js']
    // testMatch:['**/multerUserConfig.test.js']
    // testMatch:['**/messages.test.js']
    // testMatch:['**/AuthController.test.js']
    // testMatch:['**/AuthService.test.js']
    // testMatch:['**/Usuario.test.js']
    // testMatch:['**/UsuarioController.test.js']
    // testMatch:['**/AuthMiddleware.test.js']]
    // testMatch:['**/usuarioRouter.test.js']
    testMatch:['**/EquipamentoService.test.js']
   
};
