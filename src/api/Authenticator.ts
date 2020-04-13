/**
 * @Author: Reinier Millo Sánchez <millo>
 * @Date:   2020-04-12T21:28:26-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Auth Microservice API
 * @Filename: Authenticator.ts
 * @Last modified by:   millo
 * @Last modified time: 2020-04-12T22:23:13-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

import request from 'request';
import { Request, Response, NextFunction } from 'express';
import { Objects, HTTP_STATUS, Logger } from '@ikoabo/core_srv';
import { ERRORS } from '../types/errors';

export interface IAuthInfo {
  uid: string;
  application: string;
  project: string;
  domain: string;
  scope: string[];
};

export class Authenticator {
  private static _instance: Authenticator;
  private _logger: Logger;
  private _authService: string;

  /**
   * Private constructor to allow singleton instance
   */
  private constructor() {
    this._logger = new Logger('Authenticator');
  }

  /**
   * Retrieve singleton class instance
   */
  public static get shared(): Authenticator {
    if (!Authenticator._instance) {
      Authenticator._instance = new Authenticator();
    }
    return Authenticator._instance;
  }

  /**
   * Authenticate against the auth server using the given token and validate the scope
   *
   * @param token  Token to authenticate agains auth server
   * @param scope  Scope to validate
   */
  authenticate(token: string, scope?: string | string[]): Promise<IAuthInfo> {
    const self = this;
    return new Promise<IAuthInfo>((resolve, reject) => {
      if (!self._authService || self._authService.length <= 0) {
        reject({ boError: ERRORS.INVALID_AUTH_SERVER, boStatus: HTTP_STATUS.HTTP_INTERNAL_SERVER_ERROR });
        return;
      }

      if (!token) {
        reject({ boError: ERRORS.INVALID_TOKEN });
        return;
      }

      /* Prepare the request options with the given token */
      let opts = {
        auth: { bearer: token },
      };

      /* Validate the token against the auth service */
      request.post(`${self._authService}/v1/oauth/authenticate`, opts, (error: any, response: request.Response, body: any) => {
        if (error) {
          this._logger.error('Invalid auth server response', error);
          reject({ boError: ERRORS.UNKNOWN_AUTH_SERVER_ERROR, boStatus: HTTP_STATUS.HTTP_INTERNAL_SERVER_ERROR });
          return;
        }
        try { /* Try to convert response body to JSON */
          body = JSON.parse(body);
        } catch {
          reject({ boError: ERRORS.UNKNOWN_AUTH_SERVER_ERROR, boStatus: HTTP_STATUS.HTTP_INTERNAL_SERVER_ERROR });
          return;
        }

        /* Check for success/error response */
        if (body['error']) {
          reject({ boStatus: response.statusCode, boError: body['error'] });
          return;
        }

        /* On success prepare the response information */
        let auth: IAuthInfo = {
          uid: Objects.get(body, 'data.uid', null),
          application: Objects.get(body, 'data.application', null),
          project: Objects.get(body, 'data.project', null),
          domain: Objects.get(body, 'data.domain', null),
          scope: Objects.get(body, 'data.scope', []),
        }

        /* Check for valid response data */
        if (!auth.domain || !auth.project || !auth.application) {
          reject({ boError: ERRORS.AUTHENTICATION_REQUIRED, boStatus: HTTP_STATUS.HTTP_UNAUTHORIZED });
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
  public validateScope(auth: IAuthInfo, scope?: string | string[]): Promise<IAuthInfo> {
    return new Promise<IAuthInfo>((resolve, reject) => {
      /* Validate required scopes */
      if (typeof scope === 'string') {
        if (auth.scope.indexOf(scope) < 0) {
          reject({ boError: ERRORS.INVALID_SCOPE, boStatus: HTTP_STATUS.HTTP_FORBIDDEN });
          return;
        }
      } else if (Array.isArray(scope)) {
        /* Scope is an array with multiple scopes. User must hold any of the given scope */
        if (scope.filter(value => auth.scope.indexOf(value) >= 0).length === 0) {
          reject({ boError: ERRORS.INVALID_SCOPE, boStatus: HTTP_STATUS.HTTP_FORBIDDEN });
          return;
        }
      } else if (scope) {
        reject({ boError: ERRORS.INVALID_SCOPE, boStatus: HTTP_STATUS.HTTP_FORBIDDEN });
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
    const self = this;

    /* Validate the auth service configuration */
    if (!self._authService || self._authService.length <= 0) {
      return (_req: Request, _res: Response, next: NextFunction) => {
        next({ boError: ERRORS.INVALID_AUTH_SERVER, boStatus: HTTP_STATUS.HTTP_INTERNAL_SERVER_ERROR });
      };
    }

    return (req: Request, res: Response, next: NextFunction) => {
      /* Get authorization header token */
      const header: string[] = req.headers.authorization ? req.headers.authorization.split(' ') : [];
      if (!header || header.length !== 2) {
        next({ boError: ERRORS.AUTHENTICATION_REQUIRED, boStatus: HTTP_STATUS.HTTP_UNAUTHORIZED });
        return;
      }

      /* Check if the request was authenticated previously */
      if (res.locals['auth']) {
        self.validateScope(res.locals['auth'], scope)
          .then(() => {
            next();
          }).catch(next);
        return;
      }

      /* Authenticate the current request */
      self.authenticate(header[1], scope)
        .then((auth: IAuthInfo) => {
          res.locals['auth'] = auth;
          next();
        }).catch(next);
    };
  }
}
