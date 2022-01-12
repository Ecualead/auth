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

/* Export controllers */
export { AuthActionsCtrl } from "./controllers/auth.actions.controller";
export { JWT, JWTCtrl } from "./controllers/jwt.controller";
export { SecurityCtrl } from "./controllers/security.controller";

/* Export api middlewares */
export { Authentication, AuthenticationCtrl } from "./middlewares/authentication.middleware";

/* Export constants */
export { AUTH_ERRORS } from "./constants/errors.enum";
export { SCOPE_VALIDATION } from "./constants/scope.enum";
export { EXTERNAL_AUTH_TYPE, ACCOUNT_STATUS } from "./constants/oauth2.enum";
export {
  OAUTH2_TOKEN_TYPE,
  EMAIL_TOKEN_TYPE,
  LIFETIME_TYPE,
  VALIDATION_TOKEN_STATUS
} from "./constants/token.enum";

/* Export models */
export {
  IUserData,
  IUserDataDecoded,
  IRegisterData,
  ILoginData,
  IProfileUpdateData,
  IIdResponse,
  ILoginResponse,
  IProfileResponse,
  IConfirmData,
  IEmailResponse,
  IPasswordData,
  IRecoverData,
  IValidationResponse
} from "./models/data.types";
export { Security, SecurityDocument, SecurityModel } from "./models/security.model";

/* Export utility classes */
export { Credential } from "./utils/credential.util";
