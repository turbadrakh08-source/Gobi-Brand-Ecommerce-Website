/** @type {import('jest').Config} */
const config = {
  clearMocks: true,

  testEnvironment: "node",

  testMatch: ["<rootDir>/__tests__/integration/**/*.test.ts"],

  setupFiles: ["<rootDir>/jest.integration.env.ts"],

  setupFilesAfterEnv: ["<rootDir>/jest.integration.setup.ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          esModuleInterop: true,
        },
      },
    ],
  },
};

module.exports = config;
