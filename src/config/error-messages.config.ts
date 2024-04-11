import { registerAs } from '@nestjs/config';

export type OneArgMessage = (arg: string) => string;

export type TwoArgsMessage = (arg1: string, arg2: string) => string;

export type ErrorMessage = string | OneArgMessage | TwoArgsMessage;

type Config = {
  [key: string]: ErrorMessage;
};

const config: Config = {
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  JWT_CREATION_ERROR: 'Unable to create JWT token.',
  INVALID_CREDENTIALS: 'Invalid login or password.',
  ENTITY_NOT_FOUND: (arg: string) => `${arg} not found.`,
  ENTITY_EXISTS: (arg1: string, arg2: string) =>
    `${arg1} with this ${arg2} already exists. Please try another one.`,
  UNKNOWN: (arg: string) => `Something went wrong. ${arg}`,
  INVALID_TYPE: (arg1: string, arg2: string) => `${arg1} must be a ${arg2}`,
  INVALID_LENGTH_MIN: (arg1: string, arg2: string) =>
    `${arg1} must be longer than or equal to ${arg2} characters`,
};

export const errorMessagesConfig = registerAs('errorMessages', () => config);
