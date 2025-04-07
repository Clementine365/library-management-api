const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Library Management API',
    description: 'API for managing library resources, books, and users',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  schemes: ['http', 'https'],
  tags: [
    {
      name: 'Books',
      description: 'Endpoints for managing books'
    },
    {
      name: 'Users',
      description: 'Endpoints for managing library users'
    },
    {
      name: 'Loans',
      description: 'Endpoints for managing book loans'
    }
  ],
  definitions: {
    Book: {
      $title: 'The Great Gatsby',
      $author: 'F. Scott Fitzgerald',
      $isbn: '978-0743273565',
      publisher: 'Scribner',
      publicationYear: 2004,
      genre: 'Fiction',
      available: true
    },
    User: {
      $name: 'John Doe',
      $email: 'john@example.com',
      membershipType: 'regular',
      active: true
    },
    Loan: {
      $userId: '64a12b3c4d5e6f7890123456',
      $bookId: '64a12b3c4d5e6f7890123457',
      issueDate: '2025-04-07',
      dueDate: '2025-04-21',
      returnDate: null,
      status: 'active'
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/*.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);