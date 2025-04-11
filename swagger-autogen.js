const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Library Management API",
    description: "API for managing library books, users, and lending records",
    version: "1.0.0",
    contact: {
      name: "Library Management Team",
      email: "support@librarymanagement.example",
    },
  },
  host: "localhost:3000",
  schemes: ["http", "https"],
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
    sessionAuth: {
      type: "apiKey",
      in: "cookie",
      name: "connect.sid",
      description: "Session cookie for authentication",
    },
    apiKeyAuth: {
      type: "apiKey",
      in: "header",
      name: "X-API-Key",
      description: "API key for staff authentication",
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
    StaffPartial: {
      type: "object",
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
    StaffResponse: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          example: true,
        },
        data: {
          $ref: "#/definitions/Staff",
        },
      },
    },
    StaffListResponse: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          example: true,
        },
        count: {
          type: "integer",
          example: 2,
        },
        data: {
          type: "array",
          items: {
            $ref: "#/definitions/Staff",
          },
        },
      },
    },
    ErrorResponse: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          example: false,
        },
        error_code: {
          type: "string",
          example: "VALIDATION_ERROR",
        },
        message: {
          type: "string",
          example: "Staff data validation failed",
        },
        validation_errors: {
          type: "object",
          example: {
            email: ["The email format is invalid."],
          },
        },
      },
    },
  },

Book: {
  type: "object",
  required: ["title", "author", "location"],
  properties: {
    title: { type: "string", example: "The Great Gatsby" },
    author: { type: "string", example: "F. Scott Fitzgerald" },
    status: {
      type: "string",
      enum: ["available", "borrowed"],
      example: "available",
    },
    location: { type: "string", example: "Shelf B2" },
    createdAt: {
      type: "string",
      format: "date-time",
      example: "2024-04-01T12:00:00Z",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      example: "2024-04-02T09:30:00Z",
    },
  },
},
BookPartial: {
  type: "object",
  properties: {
    title: { type: "string", example: "The Great Gatsby" },
    author: { type: "string", example: "F. Scott Fitzgerald" },
    status: {
      type: "string",
      enum: ["available", "borrowed"],
      example: "borrowed",
    },
    location: { type: "string", example: "Shelf C3" },
  },
},
BookResponse: {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    data: { $ref: "#/definitions/Book" },
  },
},
BookListResponse: {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    count: { type: "integer", example: 2 },
    data: {
      type: "array",
      items: { $ref: "#/definitions/Book" },
    },
  },
},

};



const outputFile = "./swagger.json";
const endpointsFiles = [
  "./routes/books.js",
  "./routes/users.js",
  "./routes/staff.js",
  "./routes/index.js",
];

// Generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);
