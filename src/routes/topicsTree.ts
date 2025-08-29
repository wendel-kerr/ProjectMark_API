import { Router } from 'express';
import { TopicTreeService } from '../services/Services';
import { TopicRepository } from '../infra/repositories/TopicRepository';
import { ResourceRepository } from '../infra/repositories/ResourceRepository';
import { authGuard, requirePermission } from '../middleware/auth';

const topicRepo = new TopicRepository();
const resourceRepo = new ResourceRepository();
const treeService = new TopicTreeService(topicRepo, resourceRepo);

/**
 * Express router for topic tree endpoints.
 * Business rules:
 * - All routes require authentication and proper permissions.
 * - Topic trees are hierarchical and may include resources.
 */
export const topicsTreeRouter = Router();

topicsTreeRouter.use(authGuard);

/**
 * Gets the full topic tree for a given root topic.
 * Business rule: Only accessible to users with read permission on topics.
 * @route GET /topics-tree/:id
 */
topicsTreeRouter.get('/:id', requirePermission('read', 'topic'), (req, res) => {
  const includeResources = ((req.query.includeResources as string) ?? 'false').toLowerCase() === 'true';
  const tree = treeService.getTree(req.params.id, 'latest', includeResources);
  if (!tree) return res.status(404).json({ message: 'Topic not found' });
  res.json(tree);
});

/**
 * Gets the topic tree for a specific version.
 * Business rule: Version must be a positive integer or 'latest'.
 * @route GET /topics-tree/:id/version/:version
 */
topicsTreeRouter.get('/:id/version/:version', requirePermission('read', 'topic'), (req, res) => {
  const vParam = req.params.version;
  const includeResources = ((req.query.includeResources as string) ?? 'false').toLowerCase() === 'true';
  const version = vParam === 'latest' ? 'latest' : Number(vParam);
  if (version !== 'latest' && (!Number.isInteger(version) || version <= 0)) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'version must be "latest" or a positive integer' });
  }
  const tree = treeService.getTree(req.params.id, version as any, includeResources);
  if (!tree) return res.status(404).json({ message: 'Topic not found' });
  res.json(tree);
});