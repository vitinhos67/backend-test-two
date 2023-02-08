import { NextFunction, Request, Response } from 'express';
import { catchContent } from '../common/utils/readFileJSON';
import BreweriesDTO from '../dtos/BreweriesDTO';
import BreweryUpdateDTO from '../dtos/BreweryUpdate.dto';

import BreweriesService from '../services/Breweries.service';
import { InvalidArgumentError } from '../services/err/Errors';

class BreweriesHandlerController {
  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const body = BreweriesDTO.parse(req.body);

      const data = await BreweriesService.store(body).catch((e) => {
        if (e) {
          throw new InvalidArgumentError(e.message);
        }
      });

      return res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
  async find(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    const regex = /[0-9A-Fa-f]{6}/g;

    try {
      if (!regex.test(id)) {
        throw new InvalidArgumentError(
          'Error: not-valid-param; hexadecimal neccessity'
        );
      }

      const brewerie = await BreweriesService.find(id);

      return res.json(brewerie);
    } catch (error) {
      next(error);
    }
  }

  async findAllBrewelers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BreweriesService.findAllBrewelers();

      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async findAndDelete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    const regex = /[0-9A-Fa-f]{6}/g;

    try {
      if (!regex.test(id)) {
        throw new InvalidArgumentError(
          'Error: not-valid-param; hexadecimal neccessity'
        );
      }

      const brewery = await BreweriesService.FindAndDelete(id);

      return res.json(brewery);
    } catch (error) {
      next(error);
    }
  }

  async uptade(req: Request, res: Response, next: NextFunction) {
    const body = BreweryUpdateDTO.parse(req.body);
    const { id } = req.params;
    body.id = id;

    try {
      const data = await BreweriesService.update(body);

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async storeWithJSONFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { file } = req;

      if (file) {
        const content = await catchContent(file.path);

        if (content) {
          const response = await BreweriesService.storeWithJSONFile(content);
          return res.json(response);
        }
      }

      throw new Error('Error: unknown file');
    } catch (error) {
      next(error);
    }
  }
}

export default new BreweriesHandlerController();
