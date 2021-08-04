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
import { Objects } from "@ikoabo/server";
import axios, { AxiosError, AxiosResponse } from "axios";
import { AUTH_ERRORS } from "../constants/errors.enum";
import {
  IConfirmData,
  IEmailResponse,
  IIdResponse,
  ILoginData,
  ILoginResponse,
  IPasswordData,
  IProfileResponse,
  IProfileUpdateData,
  IRecoverData,
  IRegisterData,
  IValidationResponse
} from "../models/data.types";

class AuthActions {
  private static _instance: AuthActions;
  private _service: string;
  private _project: string;

  private constructor() { }

  /**
   * Get singleton class instance
   */
  public static get shared(): AuthActions {
    if (!AuthActions._instance) {
      AuthActions._instance = new AuthActions();
    }
    return AuthActions._instance;
  }

  /**
   * Set the auth service url
   *
   * @param service
   * @param project
   *
   */
  public setup(service: string, project: string) {
    this._service = service;
    this._project = project;
  }

  /**
   * Handle response errors
   *
   * @param reject
   * @returns
   */
  private _handleError(reject: any) {
    return (err: AxiosError) => {
      reject({
        boStatus: err.response.status,
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
        }
      });
    };
  }

  /**
   * Call to register new user account
   *
   * @param credential
   * @param payload
   * @returns
   */
  public register(credential: string, payload: IRegisterData): Promise<IIdResponse> {
    return new Promise<IIdResponse>((resolve, reject) => {
      axios
        .post(`${this._service}/v1/oauth/${this._project}/register`, payload, {
          headers: {
            Authorization: `Bearer ${credential}`
          }
        })
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch(this._handleError(reject));
    });
  }

  /**
   * Call to authenticate an user account
   *
   * @param credential
   * @param payload
   * @returns
   */
  public login(credential: string, payload: ILoginData): Promise<ILoginResponse> {
    return new Promise<ILoginResponse>((resolve, reject) => {
      const body = new URLSearchParams();
      body.append("grant_type", "password");
      body.append("username", payload.username);
      body.append("password", payload.password);

      axios
        .post(`${this._service}/v1/oauth/${this._project}/login`, body, {
          headers: {
            Authorization: `Basic ${credential}`,
            "Content-type": "application/x-www-form-urlencoded"
          }
        })
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch(this._handleError(reject));
    });
  }

  /**
   * Call to resend confirmation of an user account
   *
   * @param credential
   * @param payload
   * @returns
   */
  public resend(credential: string, payload: ILoginData): Promise<IEmailResponse> {
    return new Promise<IEmailResponse>((resolve, reject) => {
      const body = new URLSearchParams();
      body.append("grant_type", "password");
      body.append("username", payload.username);
      body.append("password", payload.password);

      axios
        .post(`${this._service}/v1/oauth/${this._project}/resend`, body, {
          headers: {
            Authorization: `Basic ${credential}`,
            "Content-type": "application/x-www-form-urlencoded"
          }
        })
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch(this._handleError(reject));
    });
  }

  /**
   * Call to confirm an user account
   *
   * @param credential
   * @param payload
   * @returns
   */
  public confirm(credential: string, payload: IConfirmData): Promise<IEmailResponse> {
    return new Promise<IEmailResponse>((resolve, reject) => {
      axios
        .post(`${this._service}/v1/oauth/${this._project}/confirm`, payload, {
          headers: {
            Authorization: `Bearer ${credential}`
          }
        })
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch(this._handleError(reject));
    });
  }

  /**
   * Call to change user account password
   *
   * @param credential
   * @param payload
   * @returns
   */
  public passwd(credential: string, payload: IPasswordData): Promise<IEmailResponse> {
    return new Promise<IEmailResponse>((resolve, reject) => {
      axios
        .post(`${this._service}/v1/oauth/${this._project}/password`, payload, {
          headers: {
            Authorization: `Bearer ${credential}`
          }
        })
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch(this._handleError(reject));
    });
  }

  /**
   * Call to request a recover mail for user account
   *
   * @param credential
   * @param payload
   * @returns
   */
  public recoverRequest(credential: string, payload: IEmailResponse): Promise<IEmailResponse> {
    return new Promise<IEmailResponse>((resolve, reject) => {
      axios
        .post(`${this._service}/v1/oauth/${this._project}/recover/request`, payload, {
          headers: {
            Authorization: `Bearer ${credential}`
          }
        })
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch(this._handleError(reject));
    });
  }

  /**
   * Call to validate a recover toke
   *
   * @param credential
   * @param payload
   * @returns
   */
  public recoverValidate(credential: string, payload: IConfirmData): Promise<IEmailResponse> {
    return new Promise<IEmailResponse>((resolve, reject) => {
      axios
        .post(`${this._service}/v1/oauth/${this._project}/recover/validate`, payload, {
          headers: {
            Authorization: `Bearer ${credential}`
          }
        })
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch(this._handleError(reject));
    });
  }

  /**
   * Call to store new password from recovered user account
   *
   * @param credential
   * @param payload
   * @returns
   */
  public recoverStore(credential: string, payload: IRecoverData): Promise<IEmailResponse> {
    return new Promise<IEmailResponse>((resolve, reject) => {
      axios
        .post(`${this._service}/v1/oauth/${this._project}/recover/store`, payload, {
          headers: {
            Authorization: `Bearer ${credential}`
          }
        })
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch(this._handleError(reject));
    });
  }

  /**
   * Call to validate access token
   *
   * @param credential
   * @returns
   */
  public validate(credential: string): Promise<IValidationResponse> {
    return new Promise<IValidationResponse>((resolve, reject) => {
      axios
        .post(
          `${this._service}/v1/oauth/authenticate`,
          {},
          {
            headers: {
              Authorization: `Bearer ${credential}`
            }
          }
        )
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch(this._handleError(reject));
    });
  }
  /**
   * Call to logout an user account
   *
   * @param credential
   * @returns
   */
  public logout(credential: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      axios
        .post(
          `${this._service}/v1/oauth/${this._project}/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${credential}`
            }
          }
        )
        .then(() => {
          resolve();
        })
        .catch(this._handleError(reject));
    });
  }

  /**
   * Get the current user profile
   *
   * @param credential
   * @returns
   */
  public profile(credential: string): Promise<IProfileResponse> {
    return new Promise<IProfileResponse>((resolve, reject) => {
      axios
        .get(`${this._service}/v1/oauth/${this._project}/profile`, {
          headers: {
            Authorization: `Bearer ${credential}`
          }
        })
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch(this._handleError(reject));
    });
  }

  /**
   * Update current user profile
   *
   * @param credential
   * @param payload
   * @returns
   */
  public updateProfile(credential: string, payload: IProfileUpdateData): Promise<IProfileResponse> {
    return new Promise<IProfileResponse>((resolve, reject) => {
      axios
        .put(`${this._service}/v1/oauth/${this._project}/profile`, payload, {
          headers: {
            Authorization: `Bearer ${credential}`
          }
        })
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch(this._handleError(reject));
    });
  }
}

export const AuthActionsCtrl = AuthActions.shared;
