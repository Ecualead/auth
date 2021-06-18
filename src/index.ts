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

/* Export api middlewares */
export {
  AuthenticationCtrl,
  IAuthentication,
  SCOPE_VALIDATION
} from "./middlewares/authentication.middleware";

/* Export models */
export { AUTH_ERRORS } from "./models/errors.enum";
