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
import { CRUD } from "@ecualead/server";
import { SecurityDocument, SecurityModel } from "../models/security.model";
import { Request, Response, NextFunction } from "express";
import { AUTH_ERRORS } from "../constants/errors.enum";
import { IUserDataDecoded } from "../models/data.types";
import { OAUTH2_TOKEN_TYPE } from "../constants/token.enum";

class Security extends CRUD<SecurityDocument> {
  private static _instance: Security;

  /**
   * Private constructor to allow singleton class instance
   */
  private constructor() {
    super("OAuth2:Security", SecurityModel);
  }

  /**
   * Get singleton class instance
   */
  public static get shared(): Security {
    if (!Security._instance) {
      Security._instance = new Security();
    }
    return Security._instance;
  }

  /**
   * Validate required scope present in base scope
   *
   * @param baseScope
   * @param requiredScope
   * @returns
   */
  private _validScope(baseScope: string[], requiredScope?: string[]) {
    if (!requiredScope || requiredScope.length === 0) {
      return true;
    }

    const remains = requiredScope.filter((item: string) => baseScope.indexOf(item) === -1);
    return remains.length <= 0;
  }

  /**
   * Middleware to validate user security permissions
   *
   * @param scope
   * @returns
   */
  public checkUser(scope?: string[]): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const decoded: IUserDataDecoded = res.locals["jwt"];

      /* Check token validity */
      if (decoded.ut !== OAUTH2_TOKEN_TYPE.USER && decoded.ut !== OAUTH2_TOKEN_TYPE.EXTERNAL_AUTH) {
        return next({ boError: AUTH_ERRORS.INVALID_SCOPE });
      }

      /* Fetch the registered security information */
      SecurityCtrl.fetch({
        parent: decoded.uid,
        $or: [{ type: OAUTH2_TOKEN_TYPE.USER }, { type: OAUTH2_TOKEN_TYPE.EXTERNAL_AUTH }]
      })
        .then((security: SecurityDocument) => {
          /* Check if scope are valid */
          if (!this._validScope(security.getScope(), scope)) {
            return next({ boError: AUTH_ERRORS.INVALID_SCOPE });
          }

          /* There is no scope to validate */
          if (!scope || scope.length === 0) {
            return next();
          }

          /* Search for the target app to validate the scopes */
          SecurityCtrl.fetch({
            parent: decoded.app,
            type: OAUTH2_TOKEN_TYPE.APPLICATION
          })
            .then((security: SecurityDocument) => {
              /* Check if scope are valid */
              if (!this._validScope(security.getScope(), scope)) {
                return next({ boError: AUTH_ERRORS.INVALID_SCOPE });
              }

              next();
            })
            .catch((err: any) => {
              this._logger.error("Error looking for application security", {
                error: err,
                scope: scope
              });
              return next({ boError: AUTH_ERRORS.INVALID_SCOPE });
            });
        })
        .catch((err: any) => {
          if (scope && scope.length > 0) {
            this._logger.error("Error looking for user security", { error: err, scope: scope });
            return next({ boError: AUTH_ERRORS.INVALID_SCOPE });
          }
          next();
        });
    };
  }

  /**
   * Middleware to validate application security permissions
   *
   * @param scope
   * @returns
   */
  public checkApp(scope?: string[]): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const decoded: IUserDataDecoded = res.locals["jwt"];

      /* Check token validity */
      if (decoded.ut !== OAUTH2_TOKEN_TYPE.APPLICATION) {
        return next({ boError: AUTH_ERRORS.INVALID_SCOPE });
      }

      /* Fetch the registered security information */
      SecurityCtrl.fetch({
        parent: decoded.app,
        type: OAUTH2_TOKEN_TYPE.APPLICATION
      })
        .then((security: SecurityDocument) => {
          /* Check if scope are valid */
          if (!this._validScope(security.getScope(), scope)) {
            return next({ boError: AUTH_ERRORS.INVALID_SCOPE });
          }
          next();
        })
        .catch((err: any) => {
          if (scope && scope.length > 0) {
            this._logger.error("Error looking for direct application security", {
              error: err,
              scope: scope
            });
            return next({ boError: AUTH_ERRORS.INVALID_SCOPE });
          }
          next();
        });
    };
  }

  /**
   * Middleware to validate security permissions
   *
   * @param scope
   * @returns
   */
  public checkAny(scope?: string[]): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const decoded: IUserDataDecoded = res.locals["jwt"];

      switch (decoded.ut) {
        case OAUTH2_TOKEN_TYPE.APPLICATION:
          return this.checkApp(scope)(req, res, next);
        case OAUTH2_TOKEN_TYPE.USER:
        case OAUTH2_TOKEN_TYPE.EXTERNAL_AUTH:
          return this.checkUser(scope)(req, res, next);
      }

      next({ boError: AUTH_ERRORS.INVALID_SCOPE });
    };
  }
}

export const SecurityCtrl: Security = Security.shared;
