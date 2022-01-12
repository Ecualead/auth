/**
 * Copyright (C) 2020 - 2022 ECUALEAD
 *
 * All Rights Reserved
 * Author: Reinier Millo Sánchez <rmillo@ecualead.com>
 *
 * This file is part of the Developer Auth Package
 * It can't be copied and/or distributed without the express
 * permission of the author.
 */
import { HTTP_STATUS, IServiceErrors } from "@ecualead/server";

/**
 * Predefined auth errors
 */
export const AUTH_ERRORS: IServiceErrors = {
  INVALID_AUTH_SERVER: {
    value: 1001,
    str: "invalid-auth-server",
    status: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE
  },
  UNKNOWN_AUTH_SERVER_ERROR: {
    value: 1002,
    str: "unknown-auth-server-error",
    status: HTTP_STATUS.HTTP_5XX_INTERNAL_SERVER_ERROR
  },
  INVALID_SERVER_RESPONSE: {
    value: 1003,
    str: "invalid-server-response",
    status: HTTP_STATUS.HTTP_5XX_INTERNAL_SERVER_ERROR
  },
  INVALID_AUTHORIZATION_CODE: {
    value: 1004,
    str: "invalid-authorization-code",
    status: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED
  },
  INVALID_TOKEN: {
    value: 1005,
    str: "invalid-token",
    status: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED
  },
  INVALID_REFRESH_TOKEN: {
    value: 1006,
    str: "invalid-refresh-token",
    status: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED
  },
  INVALID_SCOPE: {
    value: 1007,
    str: "invalid-scope",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  INVALID_DOMAIN: {
    value: 1008,
    str: "invalid-domain",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  INVALID_PROJECT: {
    value: 1009,
    str: "invalid-project",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  INVALID_APPLICATION: {
    value: 1010,
    str: "invalid-application",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  TOKEN_EXPIRED: {
    value: 1011,
    str: "token-expired",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  MAX_ATTEMPTS: {
    value: 1012,
    str: "max-attempts",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  NOT_ALLOWED_SIGNIN: {
    value: 1013,
    str: "not-allowed-signin",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  ACCOUNT_DISABLED: {
    value: 1014,
    str: "account-disabled",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  ACCOUNT_CANCELLED: {
    value: 1015,
    str: "account-cancelled",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  ACCOUNT_BLOCKED: {
    value: 1016,
    str: "account-blocked",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  ACCOUNT_NOT_REGISTERED: {
    value: 1017,
    str: "account-not-registered",
    status: HTTP_STATUS.HTTP_4XX_NOT_FOUND
  },
  ACCOUNT_ALREADY_CONFIRMED: {
    value: 1018,
    str: "account-already-confirmed",
    status: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE
  },
  EMAIL_NOT_CONFIRMED: {
    value: 1019,
    str: "email-not-confirmed",
    status: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE
  },
  INVALID_CREDENTIALS: {
    value: 1020,
    str: "invalid-credentials",
    status: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED
  },
  EMAIL_IN_USE: {
    value: 1021,
    str: "email-in-use",
    status: HTTP_STATUS.HTTP_4XX_CONFLICT
  },
  USER_DUPLICATED: {
    value: 1022,
    str: "user-duplicated",
    status: HTTP_STATUS.HTTP_4XX_CONFLICT
  },
  PROFILE_NOT_FOUND: {
    value: 1023,
    str: "profile-not-found",
    status: HTTP_STATUS.HTTP_4XX_NOT_FOUND
  },
  RECOVER_NOT_ALLOWED: {
    value: 1024,
    str: "recover-not-allowed",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  AUTHENTICATION_REQUIRED: {
    value: 1025,
    str: "authentication-required",
    status: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED
  },
  APPLICATION_RESTRICTED: {
    value: 1026,
    str: "application-restricted",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  INVALID_CODE_ERROR: {
    value: 1027,
    str: "invalid-code-error",
    status: HTTP_STATUS.HTTP_4XX_BAD_REQUEST
  },
  INVALID_CODE_FULL: {
    value: 1028,
    str: "invalid-code-full",
    status: HTTP_STATUS.HTTP_4XX_BAD_REQUEST
  },
  INVALID_SOCIAL_REQUEST: {
    value: 1029,
    str: "invalid-social-request",
    status: HTTP_STATUS.HTTP_4XX_BAD_REQUEST
  },
  USER_ACCOUNT_MISMATCH: {
    value: 1030,
    str: "user-account-mismatch",
    status: HTTP_STATUS.HTTP_4XX_CONFLICT
  },
  USER_SOCIAL_MISMATCH: {
    value: 1031,
    str: "user-social-mismatch",
    status: HTTP_STATUS.HTTP_4XX_CONFLICT
  },
  ACCOUNT_PROFILE_NOT_FOUND: {
    value: 1032,
    str: "account-profile-not-found",
    status: HTTP_STATUS.HTTP_4XX_NOT_FOUND
  },
  CANT_REGISTER_ANOTHER_SOCIAL: {
    value: 1033,
    str: "cant-register-another-social",
    status: HTTP_STATUS.HTTP_4XX_BAD_REQUEST
  },
  INVALID_USER_TYPE: {
    value: 1030,
    str: "invalid-user-type",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  FILE_IS_NOT_IMAGE: {
    value: 2001,
    str: "file-is-not-image",
    status: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE
  },
  INVALID_FILE_PREVIEW: {
    value: 2002,
    str: "invalid-file-preview",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  INVALID_IMAGE_RENDER: {
    value: 2003,
    str: "invalid-image-render",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  INVALID_IMAGE_URL: {
    value: 2004,
    str: "invalid-image-url",
    status: HTTP_STATUS.HTTP_4XX_FORBIDDEN
  },
  INVALID_FILE_MIMETYPE: {
    value: 2005,
    str: "invalid-file-mimetype",
    status: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE
  },
  INVALID_FILE_METADATA: {
    value: 2006,
    str: "invalid-file-metadata",
    status: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE
  }
};
