/**
 * Copyright (C) 2020 IKOA Business Opportunity
 * All Rights Reserved
 * Author: Reinier Millo Sánchez <millo@ikoabo.com>
 *
 * This file is part of the IKOA Business Opportunity Auth API.
 * It can't be copied and/or distributed without the express
 * permission of the author.
 */
import request from 'request';
import { Request, Response, NextFunction } from 'express';
import { AUTH_ERRORS } from '../models/errors.enum';
import { HTTP_STATUS, Objects } from "@ikoabo/core";


export interface IAuthentication {
  user: string;
  application: string;
  project: string;
  domain: string;
  scope: string[];
};

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
  public setup(authService: string) {
    this._authService = authService;
  }

  /**
   * Authenticate against the auth server using the given token and validate the scope
   *
   * @param token  Token to authenticate agains auth server
   * @param scope  Scope to validate
   */
  authenticate(token: string, scope?: string | string[]): Promise<IAuthentication> {
    return new Promise<IAuthentication>((resolve, reject) => {
      if (!this._authService || this._authService.length <= 0) {
        reject({ boError: AUTH_ERRORS.INVALID_AUTH_SERVER, boStatus: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE });
        return;
      }

      if (!token) {
        reject({ boError: AUTH_ERRORS.INVALID_TOKEN, boStatus: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED });
        return;
      }

      /* Prepare the request options with the given token */
      let opts = {
        auth: { bearer: token },
      };

      /* Validate the token against the auth service */
      request.post(`${this._authService}/v1/oauth/authenticate`, opts, (error: any, response: request.Response, body: any) => {
        if (error) {
          reject({ boError: AUTH_ERRORS.UNKNOWN_AUTH_SERVER_ERROR, boStatus: HTTP_STATUS.HTTP_4XX_FORBIDDEN });
          return;
        }
        try { /* Try to convert response body to JSON */
          body = JSON.parse(body);
        } catch {
          reject({ boError: AUTH_ERRORS.INVALID_SERVER_RESPONSE, boStatus: HTTP_STATUS.HTTP_4XX_FORBIDDEN });
          return;
        }

        /* Check for success/error response */
        if (body['error']) {
          reject({ boStatus: response.statusCode, boError: body['error'], boData: body['data'] });
          return;
        }

        /* On success prepare the response information */
        const auth: IAuthentication = {
          user: Objects.get(body, 'user', null),
          application: Objects.get(body, 'application', null),
          project: Objects.get(body, 'project', null),
          domain: Objects.get(body, 'domain', null),
          scope: Objects.get(body, 'scope', []),
        }

        /* Check for valid response data */
        if (!auth.domain || !auth.project || !auth.application) {
          reject({ boError: AUTH_ERRORS.AUTHENTICATION_REQUIRED, boStatus: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED });
          return;
        }

        /* Validate the user scopes */
        this.validateScope(auth, scope).then(resolve).catch(reject);
      });
    });
  }

  /**
   * Validate the scope with the authentication information
   *
   * @param auth  Authentication information
   * @param scope  Scope to be validated
   */
  public validateScope(auth: IAuthentication, scope?: string | string[]): Promise<IAuthentication> {
    return new Promise<IAuthentication>((resolve, reject) => {
      /* Validate required scopes */
      if (typeof scope === 'string') {
        if (auth.scope.indexOf(scope) < 0) {
          reject({ boError: AUTH_ERRORS.INVALID_SCOPE, boStatus: HTTP_STATUS.HTTP_4XX_FORBIDDEN });
          return;
        }
      } else if (Array.isArray(scope)) {
        /* Scope is an array with multiple scopes. User must hold any of the given scope */
        if (scope.filter(value => auth.scope.indexOf(value) >= 0).length === 0) {
          reject({ boError: AUTH_ERRORS.INVALID_SCOPE, boStatus: HTTP_STATUS.HTTP_4XX_FORBIDDEN });
          return;
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
  middleware(scope?: string | string[]): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      /* Get authorization header token */
      const header: string[] = req.headers.authorization ? req.headers.authorization.split(' ') : [];
      if (!header || header.length !== 2) {
        next({ boError: AUTH_ERRORS.AUTHENTICATION_REQUIRED, boStatus: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED });
        return;
      }

      /* Check if the request was authenticated previously */
      if (res.locals['auth']) {
        AuthenticationCtrl.validateScope(res.locals['auth'], scope)
          .then(() => {
            next();
          }).catch(next);
        return;
      }

      /* Authenticate the current request */
      AuthenticationCtrl.authenticate(header[1], scope)
        .then((auth: IAuthentication) => {
          res.locals['auth'] = auth;
          (<any>req)['user'] = auth;
          next();
        }).catch(next);
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
      if (!this._authService || this._authService.length <= 0 || !id || !secret || id.length === 0 || secret.length === 0) {
        reject({ boError: AUTH_ERRORS.INVALID_AUTH_SERVER, boStatus: HTTP_STATUS.HTTP_4XX_NOT_ACCEPTABLE });
        return;
      }

      /* Prepare the authentication credentials */
      let opts = {
        auth: { username: id, password: secret },
        form: {
          grant_type: 'client_credentials',
        },
      };

      this._retries++;
      /* Perform the authentication request against the IAM */
      request.post(`${this._authService}/v1/oauth/signin`, opts, (error: any, response: request.Response, body: any) => {
        /* Reject on error */
        if (error) {
          /* Retry the request after 1 second */
          setTimeout(() => {
            this.authService(id, secret)
              .then(() => {
                resolve();
              }).catch(reject);
          }, 1000);
          return;
        }

        /* Try to convert response body to JSON */
        try {
          body = JSON.parse(body);
        } catch (err) {
          /* Retry the request after 1 second */
          setTimeout(() => {
            this.authService(id, secret)
              .then(() => {
                resolve();
              }).catch(reject);
          }, 1000);
          return;
        }

        /* Check for success/error response */
        if (body['error']) {
          reject({ boStatus: response.statusCode, boError: body['error'], boData: body['data'] });
          return;
        }
        this._token = Objects.get(body, 'accessToken', null);
        resolve();
      });
    });
  }

  /**
   * Retrieve the auth token
   */
  public get token(): string {
    return this._token;
  }
}

export const AuthenticationCtrl = Authentication.shared;
