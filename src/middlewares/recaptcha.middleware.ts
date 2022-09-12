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
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { AUTH_ERRORS } from "../constants/errors.enum";

export class ReCaptcha {
  public static v3(action?: string) {
    return (req: Request, res: Response, next: NextFunction) => {

      /* Check for ReCaptcha bypass */
      if (process.env.NOT_RECAPTCHA === "1") {
        return next();
      }

      const secret = process.env.RECAPTCHA_SECRET;
      const token = req.body["grt"] || req.query["grt"] || req.headers["grt"];
      if (!token) {
        return next({ boError: AUTH_ERRORS.INVALID_RECAPTCHA });
      }

      axios
        .post(
          "https://www.google.com/recaptcha/api/siteverify",
          new URLSearchParams({
            secret: secret,
            response: token,
            remoteip: req.socket.remoteAddress
          }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )
        .then((response) => {
          if (
            response?.data?.success &&
            response?.data?.score > 0.5 &&
            (!action || response?.data?.action === action)
          ) {
            next();
          } else {
            return next({ boError: AUTH_ERRORS.INVALID_RECAPTCHA });
          }
        })
        .catch((err) => {
          return next({ boError: AUTH_ERRORS.INVALID_RECAPTCHA });
        });
    };
  }
}
