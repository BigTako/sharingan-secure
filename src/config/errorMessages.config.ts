import { registerAs } from '@nestjs/config';

const config = {
  UNATHORIZED: 'You are not authorized to access this resource.',
  INVALID_CREDENTIALS: 'Invalid credentials.',
  USER_EXISTS: 'User already exists.',
};

export const errorMessagesConfig = registerAs('errorMessages', () => config);
