const config = {
  clearMocks: true,
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          transform: {
            react: {
              runtime: "automatic",
            },
          },
          target: "es2022",
        },
        module: {
          type: "commonjs",
        },
      },
    ],
  },
};

module.exports = config;
