import { registerAs } from '@nestjs/config';

export type OneArgMessage = (arg: string) => string;

export type TwoArgsMessage = (arg1: string, arg2: string) => string;

export type ErrorMessage = string | OneArgMessage | TwoArgsMessage;

type Config = {
  [key: string]: ErrorMessage;
};

const config: Config = {
  UNATHORIZED: 'You are not authorized to access this resource.',
  JWT_CREATION_ERROR: 'Unable to create JWT token.',
  INVALID_CREDENTIALS: 'Invalid login or password.',
  ENTITY_NOT_FOUND: (arg: string) => `${arg} not found.`,
  ENTITY_EXISTS: (arg1: string, arg2: string) =>
    `${arg2} with this ${arg2} already exists. Please try another one.`,
  UNKNOWN: (arg: string) => `Something went wrong. ${arg}`,
};

export const errorMessagesConfig = registerAs('errorMessages', () => config);
