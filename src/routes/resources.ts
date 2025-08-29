import { Router } from 'express';
import { TopicRepository } from '../infra/repositories/TopicRepository';
import { ResourceRepository } from '../infra/repositories/ResourceRepository';
import { ResourceService } from '../services/Services';
import { authGuard, requirePermission } from '../middleware/auth';

const topicRepo = new TopicRepository();
const resourceRepo = new ResourceRepository();
const service = new ResourceService(topicRepo, resourceRepo);

/**
 * Express router for resource endpoints.
 * Business rules:
 * - All routes require authentication and proper permissions.
 * - Resources are linked to topics and support CRUD operations.
 */
export const resourcesRouter = Router();

resourcesRouter.use(authGuard);

/**
 * Creates a new resource.
 * Business rule: Requires write permission for resources.
 * @route POST /resources
 */
resourcesRouter.post('/', requirePermission('write', 'resource'), (req, res, next) => {
  try {
    const dto = service.createResource(req.body);
    res.status(201).json(dto);
  } catch (err: any) {
    if ((err as any)?.issues) return res.status(400).json({ code: 'VALIDATION_ERROR', issues: (err as any).issues });
    if (err?.message === 'TopicNotFound') return res.status(404).json({ code: 'TOPIC_NOT_FOUND' });
    return next(err);
  }
});

/**
 * Gets a resource by id.
 * Business rule: Requires read permission for resources.
 * @route GET /resources/:id
 */
resourcesRouter.get('/:id', requirePermission('read', 'resource'), (req, res) => {
  const dto = service.getResource(req.params.id);
  if (!dto) return res.status(404).json({ message: 'Resource not found' });
  res.json(dto);
});

/**
 * Lists resources by topic id.
 * Business rule: topicId is required and must exist.
 * @route GET /resources?topicId=...
 */
resourcesRouter.get('/', requirePermission('read', 'resource'), (req, res, next) => {
  const topicId = req.query.topicId as string | undefined;
  if (!topicId) return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'topicId is required' });
  try {
    const list = service.listByTopic(topicId);
    res.json(list);
  } catch (err: any) {
    if (err?.message === 'TopicNotFound') return res.status(404).json({ code: 'TOPIC_NOT_FOUND' });
    return next(err);
  }
});

/**
 * Updates a resource by id.
 * Business rule: Requires write permission for resources.
 * @route PATCH /resources/:id
 */
resourcesRouter.patch('/:id', requirePermission('write', 'resource'), (req, res, next) => {
  try {
    const dto = service.updateResource(req.params.id, req.body);
    if (!dto) return res.status(404).json({ message: 'Resource not found' });
    res.json(dto);
  } catch (err: any) {
    if ((err as any)?.issues) return res.status(400).json({ code: 'VALIDATION_ERROR', issues: (err as any).issues });
    return next(err);
  }
});

/**
 * Deletes a resource by id (soft delete).
 * Business rule: Requires write permission for resources.
 * @route DELETE /resources/:id
 */
resourcesRouter.delete('/:id', requirePermission('write', 'resource'), (req, res) => {
  const ok = service.deleteResource(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Resource not found' });
  res.status(204).send();
});