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
import { Objects } from "@ikoabo/core";
import axios, { AxiosError, AxiosResponse } from "axios";
import { AUTH_ERRORS } from "../constants/errors.enum";
import {
  IIdResponse,
  ILoginData,
  ILoginResponse,
  IProfileResponse,
  IProfileUpdateData,
  IRegisterData
} from "../models/data.types";

class AuthActions {
  private static _instance: AuthActions;
  private _service: string;
  private _project: string;

  private constructor() {}

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
