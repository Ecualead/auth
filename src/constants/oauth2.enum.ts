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
export enum EXTERNAL_AUTH_TYPE {
  UNKNOWN = 0,
  FACEBOOK = 1,
  GOOGLE = 2,
  TWITTER = 3,
  INSTAGRAM = 4,
  YAHOO = 5,
  LINKEDIN = 6,
  TELEGRAM = 7,
  OAUTH2 = 8
}

export enum ACCOUNT_STATUS {
  DISABLED_BY_ADMIN = -4,
  TEMPORALLY_BLOCKED = -3,
  CANCELLED = -2,
  DELETED = -1,
  UNKNOWN = 0,
  DISABLED = 1,
  ENABLED = 2,
  REGISTERED = 3
}
