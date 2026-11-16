/** @type {import('jest').Config} */
const config = {
  clearMocks: true,

  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
        },
      },
    ],
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/__tests__/integration/",
  ],
};

module.exports = config;
