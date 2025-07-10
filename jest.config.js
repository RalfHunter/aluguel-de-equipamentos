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
    // testMatch:['**/messages.test.js']
    // testMatch:['**/AuthController.test.js']
    // testMatch:['**/AuthService.test.js']
    // testMatch:['**/Usuario.test.js']
    // testMatch:['**/UsuarioController.test.js']
    // testMatch:['**/UsuarioService.test.js']
    // testMatch:['**/UsuarioRepository.test.js']
    // testMatch:['**/GrupoFilterBuilder.test.js']
    //testMatch:['**/UsuarioRepository.test.js']
    // testMatch:['**/AuthMiddleware.test.js']
    // testMatch:['**/errorHandler.test.js']
    // testMatch:['**/GrupoSchema.test.js']
    // testMatch:['**/usuarioRoutes.test.js']
    // testMatch:['**/authRoutes.test.js']
    // testMatch:['**/GrupoController.test.js']
    // testMatch:['**/GrupoService.test.js']
    // testMatch:['**/GrupoRepository.test.js']
    // testMatch:['**/grupoRoutes.test.js']
    // testMatch:['**/UsuarioSchema.test.js']
    // testMatch:['**/AuthHelper.test.js']
    // testMatch:['**/CustomError.test.js']
    // testMatch:['**/utils/**/*.test.js']
    // testMatch:['**/MulterErrorHandler.test.js', '**/AuthPermission.test.js', '**/AuthMiddleware.test.js', '**/multerUserConfig.test.js', '**/multerConfig.test.js']
    // testMatch:
    // ['**/AuthController.test.js', 
    //   '**/AuthService.test.js',
    //   '**/Usuario.test.js',
    //   '**/UsuarioController.test.js',
    //   '**/UsuarioService.test.js',
    //   '**/UsuarioRepository.test.js',
    //   '**/GrupoFilterBuilder.test.js',
    //   '**/AuthMiddleware.test.js',
    //   '**/GrupoController.test.js',
    //   '**/GrupoService.test.js',
    //   '**/GrupoRepository.test.js',
    //   '**/UsuarioSchema.test.js',
    //   '**/ValidatorUsuario.test.js',
    //   '**/UsuarioFilterBuilder.test.js',
    //   '**/Grupo.test.js',
    //   '**/AuthPermission.test.js'
    // ]
    testMatch:['**/avaliacaoRoutes.test.js']
    // testMatch:['**/ReservaController.test.js', '**/ReservaService.test.js', '**/ReservaRepository.test.js', '**/ReservaFilterBuilder.test.js']
};
