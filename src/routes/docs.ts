import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { getOpenApiDocument } from '../schemas/openapi';

/**
 * Express router for API documentation endpoints.
 * Business rules:
 * - Serves OpenAPI JSON and Swagger UI for API docs.
 */
export const docsRouter = Router();

const openapiDoc = getOpenApiDocument();

/**
 * Serves the OpenAPI document as JSON.
 * Business rule: Used for API clients and documentation tools.
 * @route GET /docs/openapi.json
 */
docsRouter.get('/openapi.json', (_req, res) => { res.json(openapiDoc); });

/**
 * Serves Swagger UI for interactive API documentation.
 * Business rule: Provides a user-friendly interface for exploring the API.
 * @route GET /docs/docs
 */
docsRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));