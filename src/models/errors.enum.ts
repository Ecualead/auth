/**
 * Copyright (C) 2020 - 2021 IKOA Business Opportunity
 *
 * All Rights Reserved
 * Author: Reinier Millo Sánchez <millo@ikoabo.com>
 *
 * This file is part of the IKOA Business Oportunity Auth Package
 * It can't be copied and/or distributed without the express
 * permission of the author.
 */

/**
 * Predefined auth errors
 */
export const AUTH_ERRORS = {
  INVALID_AUTH_SERVER: {
    value: 1001,
    str: "invalid-auth-server"
  },
  UNKNOWN_AUTH_SERVER_ERROR: {
    value: 1002,
    str: "unknown-auth-server-error"
  },
  INVALID_SERVER_RESPONSE: {
    value: 1003,
    str: "invalid-server-response"
  },
  INVALID_AUTHORIZATION_CODE: {
    value: 1004,
    str: "invalid-authorization-code"
  },
  INVALID_TOKEN: {
    value: 1005,
    str: "invalid-token"
  },
  INVALID_REFRESH_TOKEN: {
    value: 1006,
    str: "invalid-refresh-token"
  },
  INVALID_SCOPE: {
    value: 1007,
    str: "invalid-scope"
  },
  INVALID_DOMAIN: {
    value: 1008,
    str: "invalid-domain"
  },
  INVALID_PROJECT: {
    value: 1009,
    str: "invalid-project"
  },
  INVALID_APPLICATION: {
    value: 1010,
    str: "invalid-application"
  },
  TOKEN_EXPIRED: {
    value: 1011,
    str: "token-expired"
  },
  MAX_ATTEMPTS: {
    value: 1012,
    str: "max-attempts"
  },
  NOT_ALLOWED_SIGNIN: {
    value: 1013,
    str: "not-allowed-signin"
  },
  ACCOUNT_DISABLED: {
    value: 1014,
    str: "account-disabled"
  },
  ACCOUNT_CANCELLED: {
    value: 1015,
    str: "account-cancelled"
  },
  ACCOUNT_BLOCKED: {
    value: 1016,
    str: "account-blocked"
  },
  ACCOUNT_NOT_REGISTERED: {
    value: 1017,
    str: "account-not-registered"
  },
  ACCOUNT_ALREADY_CONFIRMED: {
    value: 1018,
    str: "account-already-confirmed"
  },
  EMAIL_NOT_CONFIRMED: {
    value: 1019,
    str: "email-not-confirmed"
  },
  INVALID_CREDENTIALS: {
    value: 1020,
    str: "invalid-credentials"
  },
  EMAIL_IN_USE: {
    value: 1021,
    str: "email-in-use"
  },
  USER_DUPLICATED: {
    value: 1022,
    str: "user-duplcated"
  },
  PROFILE_NOT_FOUND: {
    value: 1023,
    str: "profile-not-found"
  },
  RECOVER_NOT_ALLOWED: {
    value: 1024,
    str: "recover-not-allowed"
  },
  AUTHENTICATION_REQUIRED: {
    value: 1025,
    str: "authentication-required"
  },
  APPLICATION_RESTRICTED: {
    value: 1026,
    str: "application-restricted"
  },
  INVALID_CODE_ERROR: {
    value: 1027,
    str: "invalid-code-error"
  },
  INVALID_CODE_FULL: {
    value: 1028,
    str: "invalid-code-full"
  },
  INVALID_SOCIAL_REQUEST: {
    value: 1029,
    str: "invalid-social-request"
  },
  USER_ACCOUNT_MISMATCH: {
    value: 1030,
    str: "user-account-mismatch"
  },
  USER_SOCIAL_MISMATCH: {
    value: 1031,
    str: "user-social-mismatch"
  },
  ACCOUNT_PROFILE_NOT_FOUND: {
    value: 1032,
    str: "account-profile-not-found"
  },
  CANT_REGISTER_ANOTHER_SOCIAL: {
    value: 1033,
    str: "cant-register-another-social"
  }
};
