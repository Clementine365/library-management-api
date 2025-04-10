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
