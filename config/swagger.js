const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Library Management API',
    description: 'Library Management System API Documentation',
    version: '1.0.0'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  components: {
    schemas: {
      Book: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          author: { type: 'string' },
          status: { type: 'string', enum: ['available', 'borrowed'] },
          location: { type: 'string' }
        }
      },
      User: {
        type: 'object',
        properties: {
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          gender: { type: 'string', enum: ['Male', 'Female'] },
          ip_address: { type: 'string' }
        }
      },
      Staff: {
        type: 'object',
        properties: {
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          position: { type: 'string' },
          department: { type: 'string' },
          phone: { type: 'string' },
          hire_date: { type: 'string', format: 'date' },
          salary: { type: 'number' },
          is_admin: { type: 'boolean' },
          status: { type: 'string', enum: ['Active', 'On Leave', 'Terminated'] }
        }
      },
      LendingRecord: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          bookId: { type: 'string' },
          lentDate: { type: 'string', format: 'date' },
          dueDate: { type: 'string', format: 'date' },
          returnDate: { type: 'string', format: 'date' },
          status: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/login': {
      get: {
        tags: ['Auth'],
        summary: 'GitHub OAuth login',
        security: [{ githubOAuth: ['user'] }],
        responses: {
          '302': { description: 'Redirects to GitHub authentication' }
        }
      }
    },
    '/logout': {
      get: {
        tags: ['Auth'],
        summary: 'Logout current user',
        responses: {
          '302': { description: 'Redirects to homepage after logout' }
        }
      }
    },
    '/books': {
      get: {
        tags: ['Books'],
        summary: 'Get all books',
        parameters: [
          {
            in: 'query',
            name: 'title',
            schema: { type: 'string' },
            description: 'Filter by title'
          },
          {
            in: 'query',
            name: 'author',
            schema: { type: 'string' },
            description: 'Filter by author'
          },
          {
            in: 'query',
            name: 'status',
            schema: { type: 'string' },
            description: 'Filter by status'
          }
        ],
        responses: {
          '200': {
            description: 'List of books',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Book' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Books'],
        summary: 'Create a new book',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Book' }
            }
          }
        },
        responses: {
          '201': { description: 'Book created successfully' }
        }
      }
    },
    '/books/{bookId}': {
      get: {
        tags: ['Books'],
        summary: 'Get book by ID',
        parameters: [
          {
            in: 'path',
            name: 'bookId',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Book details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Book' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Books'],
        summary: 'Update book',
        parameters: [
          {
            in: 'path',
            name: 'bookId',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Book' }
            }
          }
        },
        responses: {
          '200': { description: 'Book updated successfully' }
        }
      },
      delete: {
        tags: ['Books'],
        summary: 'Delete book',
        parameters: [
          {
            in: 'path',
            name: 'bookId',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': { description: 'Book deleted successfully' }
        }
      }
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Create a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        responses: {
          '201': { description: 'User created successfully' }
        }
      }
    },
    '/lending-records': {
      get: {
        tags: ['Lending Records'],
        summary: 'Get all lending records',
        responses: {
          '200': {
            description: 'List of lending records',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/LendingRecord' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Lending Records'],
        summary: 'Create a new lending record',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LendingRecord' }
            }
          }
        },
        responses: {
          '201': { description: 'Lending record created successfully' }
        }
      }
    },
    '/lending-records/{id}': {
      get: {
        tags: ['Lending Records'],
        summary: 'Get lending record by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Lending record details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LendingRecord' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Lending Records'],
        summary: 'Update lending record',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LendingRecord' }
            }
          }
        },
        responses: {
          '204': { description: 'Lending record updated successfully' }
        }
      },
      delete: {
        tags: ['Lending Records'],
        summary: 'Delete lending record',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '204': { description: 'Lending record deleted successfully' }
        }
      }
    }
  }
};

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(swaggerDocument)
};