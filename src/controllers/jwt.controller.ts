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
import fs from "fs";
import jwt from "jsonwebtoken";
import { generateKeyPairSync } from "crypto";
import { HTTP_STATUS, Logger } from "@ecualead/server";
import { AUTH_ERRORS } from "../constants/errors.enum";
import { OAUTH2_TOKEN_TYPE } from "../constants/token.enum";
import { IUserData, IUserDataDecoded } from "../models/data.types";

export class JWT {
  private static _instance: JWT;
  private _logger: Logger;
  private _privateKey: string;
  private _publicKey: string;
  private _issuer: string;
  private _audience: string;

  /**
   * Private constructor to allow singleton instance
   */
  private constructor() {
    this._logger = new Logger("JWT");
  }

  /**
   * Initialize JWT controller
   */
  public setup(issuer: string, audience: string) {
    this._issuer = issuer;
    this._audience = audience;
  }

  /**
   * Get the singleton class instance
   */
  public static get shared(): JWT {
    if (!JWT._instance) {
      JWT._instance = new JWT();
    }
    return JWT._instance;
  }

  /**
   * Load required keys
   */
  public loadKeys(publicKey?: string, privateKey?: string) {
    /* Check to load public key */
    if (publicKey) {
      this._publicKey = fs.readFileSync(publicKey, "utf8");
      this._logger.info("Public key loaded", { key: publicKey });
    }

    /* Check to load private key */
    if (privateKey) {
      this._privateKey = fs.readFileSync(privateKey, "utf8");
      this._logger.info("Private key loaded", { key: privateKey });
    }
  }

  /**
   * Generate initials public/private keys
   */
  public generateKeys() {
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem"
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
        cipher: "aes-256-cbc",
        passphrase: ""
      }
    });

    fs.writeFileSync("private.pem", privateKey);
    fs.writeFileSync("public.pem", publicKey);
    this._logger.info("Private/Public keys generated", {
      private: "private.pem",
      public: "public.pem"
    });
  }

  /**
   * Generate JWT token signed with private key
   */
  public encode(subject: string, ttl: number, payload: IUserData): string {
    if (!this._privateKey) {
      throw new Error("Private key not found");
    }

    /* Generate the JWT token with the private key */
    return jwt.sign(
      payload,
      { key: this._privateKey, passphrase: "" },
      {
        issuer: this._issuer,
        subject: subject,
        audience: this._audience,
        expiresIn: ttl,
        algorithm: "RS256"
      }
    );
  }

  /**
   * Decode JWT token using public key
   */
  public decode(token: string): Promise<IUserDataDecoded> {
    return new Promise<IUserDataDecoded>((resolve, reject) => {
      if (!this._publicKey) {
        this._logger.error("Public key not found");
        return reject({
          boError: AUTH_ERRORS.INVALID_TOKEN,
          boStatus: HTTP_STATUS.HTTP_4XX_UNAUTHORIZED
        });
      }

      /* Get the decoded token information */
      const decoded = jwt.verify(token, this._publicKey, {
        algorithms: ["RS256"]
      }) as IUserDataDecoded;

      /* Check if the decoded token is valid */
      if (
        decoded["iss"] !== this._issuer ||
        decoded["aud"] !== this._audience ||
        (decoded["ut"] === OAUTH2_TOKEN_TYPE.USER && decoded["sub"] !== decoded["email"]) ||
        (decoded["ut"] === OAUTH2_TOKEN_TYPE.APPLICATION && decoded["sub"] !== decoded["app"])
      ) {
        return reject({ boError: AUTH_ERRORS.INVALID_TOKEN });
      }

      /* Check if the token is expired */
      if (decoded["exp"] < Date.now() / 1000) {
        return reject({ boError: AUTH_ERRORS.EXPIRED_TOKEN });
      }

      resolve(decoded);
    });
  }
}

export const JWTCtrl = JWT.shared;
