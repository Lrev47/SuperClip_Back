// This file extends Express types to fix some type compatibility issues

import express from 'express';

declare module 'express' {
  // Add proper type definitions for route handlers with response returns
  export interface Router {
    post(
      path: string,
      handler: (req: express.Request, res: express.Response) => any,
    ): express.Router;
  }

  export interface Application {
    post(
      path: string,
      handler: (req: express.Request, res: express.Response) => any,
    ): express.Application;
  }
}
