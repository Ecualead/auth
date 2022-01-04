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

export interface IAuthPayload {
  prj: string;
  app: string;
  uid: string;
  email: string;
  name: string;
  lname1: string;
  lname2: string;
  type: number;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  sub: string;
  scope?: string[];
}

export interface IRegisterData {
  email: string;
  password: string;
  name?: string;
  lastname1?: string;
  lastname2?: string;
  phone?: string;
  referral?: string;
  type?: number;
  custom1?: string;
  custom2?: string;
}

export interface ILoginData {
  username: string;
  password: string;
}

export interface IProfileUpdateData {
  name?: string;
  lastname1?: string;
  lastname2?: string;
  custom1?: string;
  custom2?: string;
}

export interface IIdResponse {
  id: string;
}

export interface ILoginResponse {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  createdAt: number;
  scope?: string[];
}

export interface IProfileResponse {
  id: string;
  name?: string;
  lastname1?: string;
  lastname2?: string;
  code?: string;
  initials?: string;
  color1?: string;
  color2?: string;
  referral?: string;
  type?: number;
  custom1?: string;
  custom2?: string;
}

export interface IConfirmData {
  email: string;
  token: string;
}

export interface IEmailResponse {
  email: string;
}

export interface IPasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface IRecoverData {
  email: string;
  token: string;
  password: string;
}

export interface IValidationResponse {
  application: string;
  project: string;
  domain: string;
  scope: string[];
  user?: string;
  username?: string;
}
