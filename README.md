# IKOABO Business Opportunity Auth API

Utility functions for IKOA Business Opportunity Identity Management Service integration. This library provide the middleware to handle security into backend API validating requests against the service.

The package is developed with the aim of being used in conjunction with the rest of the packages of the platform, but it don't restrict use it as standalone package.

[![Version npm](https://img.shields.io/npm/v/@ikoabo/auth.svg?style=flat-square)](https://www.npmjs.com/package/@ikoabo/auth)[![npm Downloads](https://img.shields.io/npm/dm/@ikoabo/auth.svg?style=flat-square)](https://npmcharts.com/compare/@ikoabo/auth?minimal=true)[![Build Status](https://gitlab.com/ikoabo/packages/auth/badges/master/pipeline.svg)](https://gitlab.com/ikoabo/packages/auth)[![coverage testing report](https://gitlab.com/ikoabo/packages/auth/badges/master/coverage.svg)](https://gitlab.com/ikoabo/packages/auth/-/commits/master)

[![NPM](https://nodei.co/npm/@ikoabo/auth.png?downloads=true&downloadRank=true)](https://nodei.co/npm/@ikoabo/auth/)

## Installation

```bash
npm install @ikoabo/auth
```

## Initialize the middleware

The authententication middleware must be initialized with the address of the Identity Management Service

```js
import { AuthenticationCtrl } from "@ikoabo/auth";
AuthenticationCtrl.setup("https://myserver.com", true);
```

After the middleware is initialized we can use it to authenticate the API Backend or to validate a received request. Validations can only done over authorization with bearer tokens, in other cases always return not authorized.

The second parameter can be used to inject the access token to each request performed with the axios if the `Authorization` header isn't set. If you don't want to set the authentication you must set the header `noauth` with any value. If you prefer not use the interceptor you can set it to false or omit.

### API Backend authentication

When the API Backend is registered into the Identity Managemen Service a credentials account are generated with an id and a secret token. This values must be used to exchange them by an access token with the API scopes. The received access token can be used to perform requests agains other API Backends.

Backend authentication can be easily integrated with the cluster server initialization:

```js
import { ClusterServer } from "@ikoabo/server";
import { AuthenticationCtrl } from "@ikoabo/auth";

/**
 * Authenticate agains auth service
 */
function requestCredentials(): Promise<void> {
  return new Promise<void>((resolve) => {
    AuthenticationCtrl.setup("https://myserver.com", true);
    AuthenticationCtrl.authService("miserviceid", "myservicesecret")
      .catch((err) => {
        console.error('Invalid authentication');
      }).finally(() => {
        resolve();
      });
  });
}

/* Initialize cluster server */
const clusterServer = ClusterServer.setup(
  { running: requestCredentials },
);

/* Run cluster with base routes */
clusterServer.run({
  ...
});
```

In this case each slave worker will authenticate against the server. The given access token can be accesed directly to allow to use it to send request to external APIs that validate against the same Identity Management Service.

```js
const token: string = AuthenticationCtrl.token;
```

## Validate authentication middleware

To authenticate the recived request we must use the middleware inside the expres router

```js
import { Router, Request, Response, NextFunction } from "express";
import { AuthenticationCtrl, SCOPE_VALIDATION } from "@ikoabo/auth";
const router = Router();

router.get(
  "/hello",
  AuthenticationCtrl.middleware(["user", "admin"], SCOPE_VALIDATION.AND_VALIADTION),
  (req: Request, res: Response, next: NextFunction) => {
    res.send("Hello World");
    res.end();
  }
);

export default router;
```

In this case we protect the request. This request can be performed only by an user that holds the `user` and `admin` scopes. If the user don't holds both scopes then can't access the resource.

```js
AuthenticationCtrl.middleware(scope?: string | string[],validation?: SCOPE_VALIDATION)
```

In case of array of scopes, it can be validated using one of the following three operations.

```js
enum SCOPE_VALIDATION {
  AND_VALIADTION = 1, // Must contain all scopes
  OR_VALIDATION = 2, // Must contain at least one scope
  NOT_VALIDATION = 3 // Must not contain any scope
}
```

Once the request is authenticated, there is some information that can be used into the backedn api to handle the service data. After success authentication we can receive the user, application, project, domain or module that is doing the request and all the scopes authorized for that request.

```js
interface IAuthentication {
  user: string;
  application: string;
  project: string;
  domain: string;
  module: string;
  scope: string[];
}
```

This information can be accessed for the express response o request:

```js
req["user"];
res.locals["auth"];
```

If the `get` request can't sent the authorization token in the header request, the token can be taken from query parameters also, using the  following middlewares combination:

```js
import { Router, Request, Response, NextFunction } from "express";
import { AuthenticationCtrl, SCOPE_VALIDATION } from "@ikoabo/auth";
const router = Router();

router.get(
  "/hello",
  AuthenticationCtrl.forceAuthToken("token"),
  AuthenticationCtrl.middleware(["user", "admin"], SCOPE_VALIDATION.AND_VALIADTION),
  (req: Request, res: Response, next: NextFunction) => {
    res.send("Hello World");
    res.end();
  }
);

export default router;
```

In this case the middleware receive the access token into the `token` query parameter. By default middleware parameter can be omited and `token` is set by default, or you can change the field name.
