const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Library Management API',
    description: 'Library Management Team 13 Project',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      githubAuth: {
        type: 'oauth2',
        flows: {
          implicit: {
            authorizationUrl: 'https://github.com/login/oauth/authorize',
            scopes: {
              'read:user': 'Read user information',
              'user:email': 'Access user email'
            }
          }
        }
      }
    },
    schemas: {
      Book: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          author: { type: 'string' },
          isbn: { type: 'string' },
          publishedYear: { type: 'integer' },
          genre: { type: 'string' },
          availableCopies: { type: 'integer' }
        }
      },
      User: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin'] }
        }
      }
    }
  },
  paths: {
    '/login': {
      get: {
        tags: ['Auth'],
        summary: 'GitHub OAuth login',
        security: [{ githubAuth: [] }],
        responses: {
          '302': {
            description: 'Redirects to GitHub for authentication'
          }
        }
      }
    },
    '/github/callback': {
      get: {
        tags: ['Auth'],
        summary: 'GitHub OAuth callback',
        responses: {
          '302': {
            description: 'Redirects after successful authentication'
          }
        }
      }
    },
    '/books': {
      get: {
        tags: ['Books'],
        summary: 'Get all books',
        responses: {
          '200': {
            description: 'List of books',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Book'
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Books'],
        summary: 'Create a new book',
        security: [{ githubAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Book'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Book created successfully'
          }
        }
      }
    }
  }
};

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = setupSwagger;