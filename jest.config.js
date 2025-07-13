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
      //  testMatch:['**/EquipamentoService.test.js', '**/EquipamentoController.test.js', '**/EquipamentoRepository.test.js', '**/equipamentoRoutes.test.js']
    // testMatch:['**/EquipamentoController.test.js']
    // testMatch:['**/EquipamentoService.test.js', '**/EquipamentoController.test.js']
    // testMatch:['**/equipamentoRoutes.test.js']
    // testMatch:['**/AuthController.test.js', '**/AuthService.test.js', '**/authRoutes.test.js']
    // testMatch:['**/multerUserConfig.test.js']
    // testMatch:['**/messages.test.js']
    // testMatch:['**/AuthController.test.js']
    // testMatch:['**/AuthService.test.js']
    // testMatch:['**/Usuario.test.js']
    // testMatch:['**/UsuarioController.test.js']
    // testMatch:['**/AuthMiddleware.test.js']]
    // testMatch:['**/usuarioRouter.test.js']
    //  testMatch:['**/EquipamentoController.test.js','**/EquipamentoQuerySchema.test.js', '**/EquipamentoSchema.test.js', '**/Equipamento.test.js', '**/equipamentoRoutes.test.js', '**/EquipamentoService.test.js', '**/EquipamentoRepository.test.js', '**/EquipamentoFilterBuilder.test.js', ]
};
 //