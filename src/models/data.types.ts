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

export interface IAuthenticationResponse {
  user: string;
  username: string;
  application: string;
  project: string;
  domain: string;
  scope: string[];
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
