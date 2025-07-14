export default  {
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  verbose: true,
  "coveragePathIgnorePatterns": [
      "/node_modules/",
      "/src/utils/helpers/index.js",
      "/utils/logger.js",
    ],
};
 