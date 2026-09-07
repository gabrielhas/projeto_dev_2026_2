import { Request, Response, NextFunction } from 'express';
import { RequestModel, RequestStatus, GamePlatform } from '../models/requestModel';
import { validateRequestInput, validateStatus } from '../utils/validators';

export class RequestController {
  /**
   * [PÚBLICO] Envia uma nova solicitação de jogo e salva no MySQL
   * POST /api/requests
   */
  static async createRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validateRequestInput(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: validation.errors[0],
          errors: validation.errors
        });
        return;
      }

      const { name, email, gameName, game_name, platform } = req.body;
      const finalGameName = (gameName || game_name).trim();

      const newRequest = await RequestModel.create(
        name,
        email,
        finalGameName,
        platform as GamePlatform
      );

      res.status(201).json({
        success: true,
        message: 'Solicitação enviada com sucesso!',
        data: newRequest
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Lista solicitações com paginação, busca e filtros por status e plataforma
   * GET /api/requests?page=1&limit=10&search=elden&status=pending&platform=PS5
   */
  static async getRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, status, platform } = req.query;

      const result = await RequestModel.findAll({
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 10,
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
        platform: platform ? String(platform) : undefined
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Busca uma solicitação específica por ID
   * GET /api/requests/:id
   */
  static async getRequestById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de solicitação inválido.'
        });
        return;
      }

      const request = await RequestModel.findById(id);
      if (!request) {
        res.status(404).json({
          success: false,
          message: 'Solicitação não encontrada.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Atualiza o status de uma solicitação
   * PATCH /api/requests/:id/status
   */
  static async updateRequestStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de solicitação inválido.'
        });
        return;
      }

      const { status } = req.body;
      if (!status || !validateStatus(status)) {
        res.status(400).json({
          success: false,
          message: 'Status inválido. Valores aceitos: pending, approved, rejected, completed.'
        });
        return;
      }

      const updatedRequest = await RequestModel.updateStatus(id, status as RequestStatus);
      if (!updatedRequest) {
        res.status(404).json({
          success: false,
          message: 'Solicitação não encontrada para atualização.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Status atualizado com sucesso!',
        data: updatedRequest
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Remove uma solicitação
   * DELETE /api/requests/:id
   */
  static async deleteRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de solicitação inválido.'
        });
        return;
      }

      const deleted = await RequestModel.delete(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Solicitação não encontrada para exclusão.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Solicitação excluída com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Retorna resumo estatístico para os KPI Cards do Dashboard
   * GET /api/requests/stats/summary
   */
  static async getRequestStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await RequestModel.getStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}
