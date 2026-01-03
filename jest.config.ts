import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  testMatch: ["<rootDir>/packages/**/test/**/*.test.ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  moduleFileExtensions: ["ts", "js", "json"],

  clearMocks: true,
};

export default config;
