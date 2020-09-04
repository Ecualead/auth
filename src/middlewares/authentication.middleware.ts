/**
 * Copyright (C) 2020 IKOA Business Opportunity
 * Author: Reinier Millo Sánchez <millo@ikoabo.com>
 *
 * This file is part of the IKOA Business Opportunity Auth API.
 */
import { HTTP_STATUS, Objects } from "@ikoabo/core";
import { Request, Response, NextFunction } from "express";
import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";
import { AUTH_ERRORS } from "../models/errors.enum";

export interface IAuthentication {
  user: string;
  application: string;
  project: string;
  domain: string;
  module: string;
  scope: string[];
}

export enum SCOPE_VALIDATION {
  AND_VALIADTION = 1,
  OR_VALIDATION = 2,
  NOT_VALIDATION = 3
}

class Authentication {
  private static _instance: Authentication;
  private _authService: string;
  private _token: string;
  private _retries: number;

  /**
   * Private constructor to allow singleton instance
   */
  private constructor() {
    this._retries = 0;
  }

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

  /**
   * Authenticate against the auth server using the given token and validate the scope
   *
   * @param token  Token to authenticate agains auth server
   * @param scope  Scope to validate
   */
  authenticate(
    token: string,
    scope?: string | string[],
    validation?: SCOPE_VALIDATION
  ): Promise<IAuthentication> {
    return new Promise<IAuthentication>((resolve, reject) => {
      if (!this._authService || this._authService.length <= 0) {
        reject({
          boError: AUTH_ERRORS.INVALID_AUTH_SERVER,
          boStatus: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE
        });
        return;
      }

      if (!token) {
        reject({ boError: AUTH_ERRORS.INVALID_TOKEN, boStatus: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED });
        return;
      }

      /* Validate the token against the auth service */
      axios
        .post(
          `${this._authService}/v1/oauth/authenticate`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        .then((response: AxiosResponse) => {
          const data = Objects.get(response, "data");

          if (!data) {
            return reject({
              boError: AUTH_ERRORS.INVALID_SERVER_RESPONSE,
              boStatus: HTTP_STATUS.HTTP_4XX_FORBIDDEN
            });
          }

          /* On success prepare the response information */
          const auth: IAuthentication = {
            user: Objects.get(data, "user", null),
            application: Objects.get(data, "application", null),
            project: Objects.get(data, "project", null),
            domain: Objects.get(data, "domain", null),
            module: Objects.get(data, "module", null),
            scope: Objects.get(data, "scope", [])
          };

          /* Validate the user scopes */
          this.validateScope(auth, scope, validation).then(resolve).catch(reject);
        })
        .catch((err: AxiosError) => {
          /* Reject the request with the same error from server */
          reject({
            boError: Objects.get(err, "response.data.error", AUTH_ERRORS.UNKNOWN_AUTH_SERVER_ERROR),
            boStatus: Objects.get(err, "response.status", HTTP_STATUS.HTTP_4XX_FORBIDDEN),
            boData: Objects.get(err, "response.data.data")
          });
        });
    });
  }

  /**
   * Validate the scope with the authentication information
   *
   * @param auth  Authentication information
   * @param scope  Scope to be validated
   */
  public validateScope(
    auth: IAuthentication,
    scope?: string | string[],
    validation?: SCOPE_VALIDATION
  ): Promise<IAuthentication> {
    return new Promise<IAuthentication>((resolve, reject) => {
      /* Validate required scopes */
      if (typeof scope === "string") {
        if (auth.scope.indexOf(scope) < 0) {
          reject({ boError: AUTH_ERRORS.INVALID_SCOPE, boStatus: HTTP_STATUS.HTTP_4XX_FORBIDDEN });
          return;
        }
      } else if (Array.isArray(scope)) {
        switch (validation) {
          case SCOPE_VALIDATION.NOT_VALIDATION:
            /* User must not hold any of the scopes */
            if (scope.filter((value) => auth.scope.indexOf(value) >= 0).length > 0) {
              reject({
                boError: AUTH_ERRORS.INVALID_SCOPE,
                boStatus: HTTP_STATUS.HTTP_4XX_FORBIDDEN
              });
              return;
            }
            break;

          case SCOPE_VALIDATION.OR_VALIDATION:
            /* User must hold any of the scopes */
            if (scope.filter((value) => auth.scope.indexOf(value) >= 0).length === 0) {
              reject({
                boError: AUTH_ERRORS.INVALID_SCOPE,
                boStatus: HTTP_STATUS.HTTP_4XX_FORBIDDEN
              });
              return;
            }
            break;

          default:
            /* User must holds all the scopes */
            if (scope.filter((value) => auth.scope.indexOf(value) >= 0).length !== scope.length) {
              reject({
                boError: AUTH_ERRORS.INVALID_SCOPE,
                boStatus: HTTP_STATUS.HTTP_4XX_FORBIDDEN
              });
              return;
            }
        }
      } else if (scope) {
        reject({ boError: AUTH_ERRORS.INVALID_SCOPE, boStatus: HTTP_STATUS.HTTP_4XX_FORBIDDEN });
        return;
      }

      resolve(auth);
    });
  }

  /**
   * Express middleware to authenticate the user request
   *
   * @params scope  Scope to be validated for the given user or application
   */
  middleware(
    scope?: string | string[],
    validation?: SCOPE_VALIDATION
  ): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      /* Get authorization header token */
      const header: string[] = req.headers.authorization
        ? req.headers.authorization.split(" ")
        : [];
      if (!header || header.length !== 2) {
        next({
          boError: AUTH_ERRORS.AUTHENTICATION_REQUIRED,
          boStatus: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED
        });
        return;
      }

      /* Check if the request was authenticated previously */
      if (res.locals["auth"]) {
        this.validateScope(res.locals["auth"], scope, validation)
          .then(() => {
            next();
          })
          .catch(next);
        return;
      }

      /* Authenticate the current request */
      this.authenticate(header[1], scope, validation)
        .then((auth: IAuthentication) => {
          const reqTmp: any = req;
          res.locals["auth"] = auth;
          reqTmp["user"] = auth;
          next();
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
  public authService(id: string, secret: string): Promise<void> {
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
        reject({
          boError: AUTH_ERRORS.INVALID_AUTH_SERVER,
          boStatus: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE
        });
        return;
      }

      /* Prepare the request body */
      const body = new URLSearchParams();
      body.append("grant_type", "client_credentials");

      /* Perform the authentication request against the IAM */
      this._retries++;
      axios
        .post(`${this._authService}/v1/oauth/signin`, body, {
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
              this.authService(id, secret)
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
          const errCode = Objects.get(
            err,
            "response.data.error",
            AUTH_ERRORS.UNKNOWN_AUTH_SERVER_ERROR
          );
          const errStatus = Objects.get(err, "response.status", HTTP_STATUS.HTTP_5XX_BAD_GATEWAY);

          /* Check if the authentication server seems offline */
          if (
            errStatus === HTTP_STATUS.HTTP_5XX_BAD_GATEWAY ||
            errCode === AUTH_ERRORS.UNKNOWN_AUTH_SERVER_ERROR
          ) {
            /* Retry the request after 5 second */
            return setTimeout(() => {
              this.authService(id, secret)
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
          return next({
            boError: AUTH_ERRORS.AUTHENTICATION_REQUIRED,
            boStatus: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED
          });
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
