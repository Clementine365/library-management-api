const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Library-management-api",
    description: "Library Management Team 13 Project",
    version: "1.0.0",
    contact: {
      name: "Library Management Team",
      email: "support@librarymanagement.example",
    },
  },
  host: "localhost:3000",
  schemes: ["http"],
  tags: [
    {
      name: "Books",
      description: "API endpoints for managing books",
    },
    {
      name: "Users",
      description: "API endpoints for managing users",
    },
    {
      name: "Staff",
      description: "API endpoints for managing library staff members",
    },
    {
      name: "Authentication",
      description: "API endpoints for authentication",
    },
  ],
  securityDefinitions: {
    GitHubOAuth: {
      type: "oauth2",
      flow: "accessCode",
      authorizationUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      scopes: {
        "read:user": "Read user info",
      },
    },
  },
  definitions: {
    Staff: {
      type: "object",
      required: ["first_name", "last_name", "email", "position", "department"],
      properties: {
        first_name: {
          type: "string",
          example: "John",
          description: "First name of staff member",
        },
        last_name: {
          type: "string",
          example: "Doe",
          description: "Last name of staff member",
        },
        email: {
          type: "string",
          format: "email",
          example: "john.doe@library.com",
          description: "Email address (unique)",
        },
        phone: {
          type: "string",
          example: "123-456-7890",
          description: "Contact phone number",
        },
        position: {
          type: "string",
          example: "Senior Librarian",
          description: "Staff position/role (e.g., Librarian, Manager)",
        },
        department: {
          type: "string",
          example: "Fiction",
          description: "Department they work in",
        },
        hire_date: {
          type: "string",
          format: "date",
          example: "2023-01-15",
          description: "Date when staff was hired",
        },
        salary: {
          type: "number",
          example: 50000,
          description: "Staff salary",
        },
        is_admin: {
          type: "boolean",
          example: false,
          description: "Whether the staff has admin privileges",
        },
        status: {
          type: "string",
          enum: ["Active", "On Leave", "Terminated"],
          example: "Active",
          description: "Current employment status",
        },
      },
    },
    LoginResponse: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          example: true,
        },
        message: {
          type: "string",
          example: "You are now logged in with a test account",
        },
        user: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "test-user-id",
            },
            username: {
              type: "string",
              example: "testuser",
            },
            displayName: {
              type: "string",
              example: "Test User",
            },
          },
        },
      },
    },
  },
  paths: {
    "/test-login": {
      get: {
        tags: ["Authentication"],
        summary: "Login with a test account (for development/testing only)",
        responses: {
          200: {
            description: "Login successful",
            schema: {
              $ref: "#/definitions/LoginResponse",
            },
          },
        },
      },
    },
    "/login": {
      get: {
        tags: ["Authentication"],
        summary: "Login with GitHub",
        description: "Redirects to GitHub for authentication",
        responses: {
          302: {
            description: "Redirect to GitHub",
          },
        },
      },
    },
    "/logout": {
      get: {
        tags: ["Authentication"],
        summary: "Logout the current user",
        description: "Ends the user session and redirects to home",
        responses: {
          302: {
            description: "Redirect to home page after logout",
          },
        },
      },
    },
  },
};

const outputFile = "./swagger.json";
const endpointsFiles = [
  "./routes/index.js",
];

// Generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);
