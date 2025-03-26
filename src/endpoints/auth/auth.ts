import { Endpoint, EndpointAuthType, EndpointMethod, generateJwtToken } from 'node-server-engine';
import { Request, Response } from 'express';
import { loginHandler } from './auth.handler';
import { loginValidator } from './auth.validator';
import { 
  AUTH_USER_NOT_FOUND,
  AUTH_LOGIN_ERROR
 } from './auth.const';

export const loginEndpoint = new Endpoint({
  path: "/auth/login",
  method: EndpointMethod.POST,
  handler: async (req, res): Promise<void> => {
    try {
      const { email, password } = req.body;

      const login = await loginHandler(email, password);
      if(!login) {
        res.status(404).json({ message: AUTH_USER_NOT_FOUND });
        return;
      }

      res.status(200).json({ message: "Logged in successfully", login});
    } catch (error) {
      res.status(401).json({ message: AUTH_LOGIN_ERROR, error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: loginValidator,
});
