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
import { HTTP_STATUS, Objects } from "@ecualead/server";
import { Request, Response, NextFunction } from "express";
import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";
import { AUTH_ERRORS } from "../constants/errors.enum";
import { IUserDataDecoded } from "../models/data.types";
import { SCOPE_VALIDATION } from "../constants/scope.enum";
import { JWTCtrl } from "../controllers/jwt.controller";
import { OAUTH2_TOKEN_TYPE } from "../constants/token.enum";

export class Authentication {
  private static _instance: Authentication;
  private _authService: string;
  private _token: string;

  /**
   * Private constructor to allow singleton instance
   */
  private constructor() {}

  /**
   * Get singleton class instance
   */
  public static get shared(): Authentication {
    if (!Authentication._instance) {
      Authentication._instance = new Authentication();
    }
    return Authentication._instance;
  }

  /**
   * Set the auth service url
   *
   * @param authService  Auth service url to use
   */
  public setup(authService: string, useInterceptor?: boolean) {
    this._authService = authService;

    if (!useInterceptor) {
      return;
    }

    /**
     * AXIOS interceptor to inject authentication into requests
     */
    axios.interceptors.request.use((request: AxiosRequestConfig) => {
      /* Append content type header if its not present */
      if (!request.headers["Content-Type"]) {
        request.headers["Content-Type"] = "application/json";
      }

      /* Check if the request must bypass the Authorization header */
      if (request.headers.noauth) {
        delete request.headers.Authorization;
        delete request.headers.noauth;
        return request;
      }

      /* Check if authorization is not set and the token exist */
      if (!request.headers["Authorization"] && this._token) {
        /* Check if the user is authenticated to send Bearer token */
        request.headers.Authorization = "Bearer " + this._token;
      }
      return request;
    });
  }

  private _getHeader(req: Request): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      /* Get authorization header token */
      let header: string[] = req.headers.authorization ? req.headers.authorization.split(" ") : [];
      if (!header || header.length !== 2) {
        /* If the header is not set then try to get token from query parameters */
        const token = Objects.get(req, "query.bt");
        if (!token) {
          return reject({ boError: AUTH_ERRORS.AUTHENTICATION_REQUIRED });
        }

        /* Set the query token */
        header = ["Bearer", token];
      }

      resolve(header[1]);
    });
  }

  /**
   * Validate the scope with the authentication information
   *
   * @param auth  Authentication information
   * @param scope  Scope to be validated
   */
  private _validateScope(
    user: IUserDataDecoded,
    scope?: string | string[],
    validation?: SCOPE_VALIDATION
  ): Promise<IUserDataDecoded> {
    return new Promise<IUserDataDecoded>((resolve, reject) => {
      /* Validate required scopes */
      if (typeof scope === "string") {
        if (user.scope.indexOf(scope) < 0) {
          return reject({ boError: AUTH_ERRORS.INVALID_SCOPE });
        }
      } else if (Array.isArray(scope)) {
        switch (validation) {
          case SCOPE_VALIDATION.NOT:
            /* User must not hold any of the scopes */
            if (scope.filter((value) => user.scope.indexOf(value) >= 0).length > 0) {
              return reject({ boError: AUTH_ERRORS.INVALID_SCOPE });
            }
            break;

          case SCOPE_VALIDATION.OR:
            /* User must hold any of the scopes */
            if (scope.filter((value) => user.scope.indexOf(value) >= 0).length === 0) {
              return reject({ boError: AUTH_ERRORS.INVALID_SCOPE });
            }
            break;

          default:
            /* User must holds all the scopes */
            if (scope.filter((value) => user.scope.indexOf(value) >= 0).length !== scope.length) {
              return reject({ boError: AUTH_ERRORS.INVALID_SCOPE });
            }
        }
      } else if (scope) {
        return reject({ boError: AUTH_ERRORS.INVALID_SCOPE });
      }

      resolve(user);
    });
  }

  /**
   * Express middleware to authenticate the user request
   *
   * @params scope  Scope to be validated for the given user or application
   */
  private _validateOAuth2(
    decoded: IUserDataDecoded,
    scope: string | string[],
    validation?: SCOPE_VALIDATION
  ): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      this._getHeader(req)
        .then((token: string) => {
          if (!this._authService || this._authService.length <= 0) {
            return next({ boError: AUTH_ERRORS.INVALID_AUTH_SERVER });
          }

          if (!token) {
            return next({ boError: AUTH_ERRORS.INVALID_TOKEN });
          }

          /* Validate the token against the auth service */
          axios
            .get(`${this._authService}/authenticate`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            .then((response: AxiosResponse) => {
              const data = Objects.get(response, "data");

              if (!data) {
                return next({ boError: AUTH_ERRORS.INVALID_SERVER_RESPONSE });
              }

              /* Validate the user scopes */
              decoded.scope = Objects.get(data, "scope", []);
              this._validateScope(decoded, scope, validation)
                .then((auth: IUserDataDecoded) => {
                  res.locals["jwt"] = auth;
                  (req as any).user = res.locals["jwt"];
                  next();
                })
                .catch(next);
            })
            .catch((err: AxiosError) => {
              /* Reject the request with the same error from server */
              next({
                boError: {
                  value: Objects.get(
                    err,
                    "response.data.error",
                    AUTH_ERRORS.UNKNOWN_AUTH_SERVER_ERROR.value
                  ),
                  str: Objects.get(
                    err,
                    "response.data.description",
                    AUTH_ERRORS.UNKNOWN_AUTH_SERVER_ERROR.str
                  )
                },
                boStatus: Objects.get(err, "response.status", HTTP_STATUS.HTTP_4XX_FORBIDDEN),
                boData: Objects.get(err, "response.data.data")
              });
            });
        })
        .catch(next);
    };
  }

  /**
   * Validate user account
   */
  private _validateUser(
    decoded: IUserDataDecoded,
    userType?: number,
    scope?: string | string[],
    validation?: SCOPE_VALIDATION
  ): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      if (
        decoded.sub === decoded.app ||
        (userType && decoded.type !== userType) ||
        (decoded.ut !== OAUTH2_TOKEN_TYPE.USER && decoded.ut !== OAUTH2_TOKEN_TYPE.EXTERNAL_AUTH)
      ) {
        return next({ boError: AUTH_ERRORS.INVALID_USER });
      }
      res.locals["jwt"] = decoded;
      (req as any).user = decoded;

      /* Check to validate the scope */
      if (scope && scope.length > 0) {
        return this._validateOAuth2(decoded, scope, validation)(req, res, next);
      }

      next();
    };
  }

  /**
   * Express middleware to authenticate an user
   */
  checkUser(
    userType?: number,
    scope?: string | string[],
    validation?: SCOPE_VALIDATION
  ): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      this._getHeader(req)
        .then((token: string) => {
          JWTCtrl.decode(token)
            .then((decoded: IUserDataDecoded) => {
              this._validateUser(decoded, userType, scope, validation)(req, res, next);
            })
            .catch(next);
        })
        .catch(next);
    };
  }

  /**
   * Validate application
   *
   * @param decoded
   * @param scope
   * @param validation
   * @returns
   */
  private _validateApp(
    decoded: IUserDataDecoded,
    scope?: string | string[],
    validation?: SCOPE_VALIDATION
  ): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      if (decoded.ut !== OAUTH2_TOKEN_TYPE.APPLICATION || decoded.sub !== decoded.app) {
        return next({ boError: AUTH_ERRORS.INVALID_USER });
      }

      res.locals["jwt"] = decoded;
      (req as any).user = decoded;

      /* Check to validate the scope */
      if (scope && scope.length > 0) {
        return this._validateOAuth2(decoded, scope, validation)(req, res, next);
      }

      next();
    };
  }

  /**
   * Express middleware to authenticate an application
   */
  checkApp(
    scope?: string | string[],
    validation?: SCOPE_VALIDATION
  ): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      this._getHeader(req)
        .then((token: string) => {
          JWTCtrl.decode(token)
            .then((decoded: IUserDataDecoded) => {
              this._validateApp(decoded, scope, validation)(req, res, next);
            })
            .catch(next);
        })
        .catch(next);
    };
  }

  /**
   * Express middleware to authenticate a request
   */
  checkAny(
    scope?: string | string[],
    validation?: SCOPE_VALIDATION
  ): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      this._getHeader(req)
        .then((token: string) => {
          JWTCtrl.decode(token)
            .then((decoded: IUserDataDecoded) => {
              switch (decoded.ut) {
                case OAUTH2_TOKEN_TYPE.USER:
                case OAUTH2_TOKEN_TYPE.EXTERNAL_AUTH:
                  return this._validateUser(decoded, null, scope, validation)(req, res, next);
                case OAUTH2_TOKEN_TYPE.APPLICATION:
                  return this._validateApp(decoded, scope, validation)(req, res, next);
              }

              next({ boError: AUTH_ERRORS.INVALID_USER });
            })
            .catch(next);
        })
        .catch(next);
    };
  }

  /**
   * Authenticate the service application
   *
   * @param id  Application id of the service
   * @param secret  Application secret of the service
   */
  public authApp(id: string, secret: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      /* Validate the auth service configuration */
      if (
        !this._authService ||
        this._authService.length <= 0 ||
        !id ||
        !secret ||
        id.length === 0 ||
        secret.length === 0
      ) {
        return reject({ boError: AUTH_ERRORS.INVALID_AUTH_SERVER });
      }

      /* Prepare the request body */
      const body = new URLSearchParams();
      body.append("grant_type", "client_credentials");

      /* Perform the authentication request against the IAM */
      axios
        .post(`${this._authService}/token`, body, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          auth: {
            username: id,
            password: secret
          }
        })
        .then((response: AxiosResponse) => {
          const data = Objects.get(response, "data");

          if (!data) {
            /* Retry the request after 5 second */
            return setTimeout(() => {
              this.authApp(id, secret)
                .then(() => {
                  resolve();
                })
                .catch(reject);
            }, 5000);
          }

          this._token = Objects.get(data, "accessToken");
          resolve();
        })
        .catch((err: AxiosError) => {
          const errCode = {
            value: Objects.get(
              err,
              "response.data.error",
              AUTH_ERRORS.UNKNOWN_AUTH_SERVER_ERROR.value
            ),
            str: Objects.get(
              err,
              "response.data.description",
              AUTH_ERRORS.UNKNOWN_AUTH_SERVER_ERROR.str
            )
          };
          const errStatus = Objects.get(err, "response.status", HTTP_STATUS.HTTP_5XX_BAD_GATEWAY);

          /* Check if the authentication server seems offline */
          if (
            errStatus === HTTP_STATUS.HTTP_5XX_BAD_GATEWAY ||
            errCode.value === AUTH_ERRORS.UNKNOWN_AUTH_SERVER_ERROR.value
          ) {
            /* Retry the request after 5 second */
            return setTimeout(() => {
              this.authApp(id, secret)
                .then(() => {
                  resolve();
                })
                .catch(reject);
            }, 5000);
          }

          /* Reject the request with the same error from server */
          reject({
            boError: errCode,
            boStatus: errStatus,
            boData: Objects.get(err, "response.data.data")
          });
        });
    });
  }

  /**
   * Authenticate the service application
   *
   * @param id  Application id of the service
   * @param secret  Application secret of the service
   */
   public setToken(token: string) {
    this._token = token;
  }

  /**
   * Force request to be authenticated. If the access token is not
   * set in header, then try to get from query parameters
   *
   * @param req
   * @param _res
   * @param next
   */
  public forceAuthToken(field = "token"): any {
    return (req: Request, _res: Response, next: NextFunction) => {
      /* Check for authorization token */
      let token = Objects.get(req, "headers.authorization");
      if (!token) {
        /* Get the authorization token from URL */
        token = Objects.get(req, `query.${field}`, "");
        if (!token) {
          return next({ boError: AUTH_ERRORS.AUTHENTICATION_REQUIRED });
        }

        /* Force authorization token from URL */
        req.headers.authorization = `Bearer ${token}`;
      }

      next();
    };
  }

  /**
   * Retrieve the auth token
   */
  public get token(): string {
    return this._token;
  }
}

export const AuthenticationCtrl = Authentication.shared;
