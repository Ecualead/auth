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
import { BaseModel } from "@ecualead/server";
import { prop, index, getModelForClass, DocumentType } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { OAUTH2_TOKEN_TYPE } from "../constants/token.enum";

function fillTypeScope(type: OAUTH2_TOKEN_TYPE, scope: string[]): string[] {
  /* Check for valid scope array */
  if (!scope) {
    scope = [];
  }
  scope.push("default");

  /* Check if the token belongs to user or application */
  if (type === OAUTH2_TOKEN_TYPE.APPLICATION) {
    scope.push("application");
    scope.push("non_user");
  } else {
    scope.push("user");
  }

  /* Check for external auth token */
  if (type === OAUTH2_TOKEN_TYPE.EXTERNAL_AUTH) {
    scope.push("external_auth");
  }

  return scope;
}

@index({ parent: 1 }, { unique: true })
@index({ type: 1 })
export class Security extends BaseModel {
  @prop({ type: mongoose.Types.ObjectId, required: true })
  parent!: string;

  @prop({ required: true, enum: OAUTH2_TOKEN_TYPE, default: OAUTH2_TOKEN_TYPE.USER })
  type: OAUTH2_TOKEN_TYPE;

  @prop({ type: String })
  scope?: string[];

  public getScope(): string[] {
    return fillTypeScope(this.type, this.scope);
  }

  /**
   * Get the mongoose data model
   */
  static get shared() {
    return getModelForClass(Security, {
      schemaOptions: {
        collection: "oauth2.security",
        timestamps: true,
        toJSON: {
          virtuals: true,
          versionKey: false,
          transform: (_doc: any, ret: any) => {
            const retObj = {
              parent: ret.parent,
              type: ret.type,
              scope: ret.scope || [],
              client: ret.application,
              createdAt: ret.createdAt
            };

            retObj.scope = fillTypeScope(retObj.type, retObj.scope);
            return retObj;
          }
        }
      },
      options: { automaticName: false }
    });
  }
}

export type SecurityDocument = DocumentType<Security>;
export const SecurityModel: mongoose.Model<SecurityDocument> = Security.shared;
