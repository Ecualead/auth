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
export enum OAUTH2_TOKEN_TYPE {
  UNKNOWN = 0,
  APPLICATION,
  USER,
  EXTERNAL_AUTH
}

export enum EMAIL_TOKEN_TYPE {
  DISABLED = 0,
  LINK = 1,
  CODE = 2,
  BOTH = 3
}

/* Lifetime predefined values in milliseconds */
export enum LIFETIME_TYPE {
  INHERIT = 0,
  INFINITE = -1,
  HOUR = 3600000,
  DAY = 86400000,
  WEEK = 604800000,
  MONTH = 2629743000,
  YEAR = 31556926000
}

export enum VALIDATION_TOKEN_STATUS {
  DISABLED = 0,
  TO_CONFIRM = 1,
  TO_RECOVER = 2,
  PARTIAL_CONFIRMED = 3,
  TO_LOGIN = 4
}
