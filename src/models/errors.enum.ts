/**
 * Copyright (C) 2020 IKOA Business Opportunity
 * Author: Reinier Millo Sánchez <millo@ikoabo.com>
 *
 * This file is part of the IKOA Business Opportunity Auth API.
 */

/**
 * Predefined auth errors
 */
export enum AUTH_ERRORS {
  INVALID_AUTH_SERVER = 1001,
  UNKNOWN_AUTH_SERVER_ERROR,
  INVALID_SERVER_RESPONSE,
  INVALID_AUTHORIZATION_CODE,
  INVALID_TOKEN,
  INVALID_REFRESH_TOKEN,
  INVALID_SCOPE,
  INVALID_DOMAIN,
  INVALID_PROJECT,
  INVALID_APPLICATION,
  TOKEN_EXPIRED,
  MAX_ATTEMPTS,
  NOT_ALLOWED_SIGNIN,
  ACCOUNT_DISABLED,
  ACCOUNT_CANCELLED,
  ACCOUNT_BLOCKED,
  ACCOUNT_NOT_REGISTERED,
  ACCOUNT_ALREADY_CONFIRMED,
  EMAIL_NOT_CONFIRMED,
  INVALID_CREDENTIALS,
  EMAIL_IN_USE,
  USER_DUPLICATED,
  PROFILE_NOT_FOUND,
  RECOVER_NOT_ALLOWED,
  AUTHENTICATION_REQUIRED,
  APPLICATION_RESTRICTED,
  INVALID_CODE_ERROR,
  INVALID_CODE_FULL,
  INVALID_SOCIAL_REQUEST,
  USER_ACCOUNT_MISMATCH,
  USER_SOCIAL_MISMATCH,
  ACCOUNT_PROFILE_NOT_FOUND,
  CANT_REGISTER_ANOTHER_SOCIAL
}
