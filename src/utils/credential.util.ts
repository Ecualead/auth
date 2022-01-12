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
import { AUTH_ERRORS } from "../constants/errors.enum";

export class Credential {
  /**
   * Parse authorization headers
   *
   * @param authorization
   * @param type
   * @returns
   */
  private static _checkAuthorization(authorization: string, type: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const base: string[] = authorization.split(" ");
      if (base.length !== 2 && base[0].toUpperCase() !== type) {
        return reject({ boError: AUTH_ERRORS.INVALID_CREDENTIALS });
      }

      resolve(base[1]);
    });
  }

  /**
   * Extract basic authorization token
   *
   * @param authorization
   * @returns
   */
  public static basic(authorization: string): Promise<string> {
    return Credential._checkAuthorization(authorization, "BASIC");
  }

  /**
   * Extract bearer authorization token
   *
   * @param authorization
   * @returns
   */
  public static bearer(authorization: string): Promise<string> {
    return Credential._checkAuthorization(authorization, "BEARER");
  }
}
