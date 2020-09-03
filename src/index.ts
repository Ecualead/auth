/**
 * Copyright (C) 2020 IKOA Business Opportunity
 * Author: Reinier Millo Sánchez <millo@ikoabo.com>
 *
 * This file is part of the IKOA Business Opportunity Auth API.
 */

/* Export api middlewares */
export {
  AuthenticationCtrl,
  IAuthentication,
  SCOPE_VALIDATION
} from "./middlewares/authentication.middleware";

/* Export models */
export { AUTH_ERRORS } from "./models/errors.enum";
