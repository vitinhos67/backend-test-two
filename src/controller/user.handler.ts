import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';

import jwt from '../common/utils/auth/jwt';

import { UserCreateDTO, UserLoginDTO } from '../dtos/User/User.dto';
import { InvalidArgumentError } from '../services/err/Errors';
import UserService from '../services/User.service';

class UserHandler {
  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const body = UserCreateDTO.parse(req.body);

      const data = await UserService.store(body);

      if (data) {
        res.setHeader('Authorization', data.access_key);
        res.setHeader('reflesh_token', data.reflesh_token);

        res.status(201).json({
          user: data.user,
          token: {
            authorization: data.access_key,
            reflesh_token: data.reflesh_token
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async findUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const data = await UserService.findUserById(id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.findAll();

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = UserLoginDTO.parse(req.body);

      const data = await UserService.login(body);

      if (data) {
        res.setHeader('Authorization', data?.access_key);
        res.setHeader('reflesh_token', data?.reflesh_token);

        return res.status(200).json({
          message: 'login acceppt.',
          statusCode: 200,
          authorization: data.access_key,
          reflesh_token: data.reflesh_token
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async findUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { authorization } = req.headers;

      if (authorization) {
        const [, token] = authorization.split(' ');

        const decodedToken = jwt.decrypt(token);

        if (!decodedToken) {
          throw new InvalidArgumentError('Invalid token');
        }

        if (
          typeof decodedToken === 'object' &&
          !(decodedToken instanceof JsonWebTokenError)
        ) {
          const findUser = await UserService.findUserById(decodedToken.id);

          if (!findUser) {
            throw new InvalidArgumentError('Error: User not find');
          }

          delete findUser.password;

          return res.status(200).json(findUser);
        }
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new UserHandler();
