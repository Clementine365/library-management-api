
# Library Management System

## CSE 341 Final Project Proposal

### General Info

**NAMES**  
- Clementine Iradukunda  
- Farai Dandara  
- Cristobal Alfonso Henriquez  
- Joseph Uchenna Israel  
- Andrew Obinna Onyekwere  

**Application Name**  
**Library Management System**

---

## Contents

- [General Info](#general-info)
- [Application Info](#application-info)
  - [What will the API do?](#what-will-the-api-do)
  - [How will your API utilize a login system?](#how-will-your-api-utilize-a-login-system)
  - [What database will you use?](#what-database-will-you-use)
  - [How will the data be stored in your database?](#how-will-the-data-be-stored-in-your-database)
  - [How would a frontend be able to manage authentication state based on the data you provide?](#how-would-a-frontend-be-able-to-manage-authentication-state-based-on-the-data-you-provide)
  - [What pieces of data in your app will need to be secured? How will you demonstrate web security principles in the development of this app?](#what-pieces-of-data-in-your-app-will-need-to-be-secured-how-will-you-demonstrate-web-security-principles-in-the-development-of-this-app)
  - [What file structure and program architecture will you use for this project? Why?](#what-file-structure-and-program-architecture-will-you-use-for-this-project-why)
  - [What are potential stretch challenges that you could implement to go above and beyond?](#what-are-potential-stretch-challenges-that-you-could-implement-to-go-above-and-beyond)
- [API Endpoint Planning](#api-endpoint-planning)
- [Project Scheduling and Delegation](#project-scheduling-and-delegation)
- [Potential Risks and Risk Mitigation Techniques](#potential-risks-and-risk-mitigation-techniques)

---

## Application Info

### What will the API do?

The API will handle the backend operations for a Library Management System. It will manage key entities such as Users (library members), Books, Lending Records, and Staff. The API will enable functionalities such as creating and managing users, adding and searching for books, keeping track of lending transactions, and storing staff data. It will also support login, authentication, and user management, ensuring secure access to sensitive data.

### How will your API utilize a login system?

The API will utilize a login system based on authentication tokens (such as JWT or OAuth). Upon successful login, the system will issue a token that will be used for subsequent requests to verify the identity and permissions of the user. For example, library members and staff will be authenticated before performing any CRUD operations on books, lending records, or staff data. User credentials (username, password) will be securely stored, and passwords will be hashed to ensure security.

### What database will you use?

We will use MongoDB as the database for this API.

### How will the data be stored in your database?

The data will be stored in collections in MongoDB:

- **Users**: Stores user details like name, email, membership status, etc.
- **Books**: Stores book details such as title, author, ISBN, availability status, etc.
- **Lending Records**: Stores records of books lent out to users, including dates and due dates.
- **Staff**: Stores information about library staff, including role and contact details.

### How would a frontend be able to manage authentication state based on the data you provide?

The frontend will use the authentication token received after a successful login to manage the authentication state. Once the token is stored (typically in `localStorage` or `sessionStorage`), the frontend can send the token as part of the Authorization header in subsequent requests to verify the user's identity. If the token is valid, the user will have access to the application; if not, they will be prompted to log in again. The frontend will check for the existence of the token upon page load to determine if the user is authenticated.

### What pieces of data in your app will need to be secured? How will you demonstrate web security principles in the development of this app?

- **Password storage**: Passwords will be hashed using bcrypt.
- **JWT**: Tokens will be secured and transmitted via HTTPS.
- **Input validation and sanitization** will be used to prevent injection attacks.

### What file structure and program architecture will you use for this project? Why?

```
/src
  /config         # Configuration files (e.g., env, DB config)
  /controllers    # API endpoint controllers (business logic)
  /models         # Database models (schemas)
  /routes         # API routes
  /middlewares    # Middleware (auth, error handling)
  /services       # Business logic services (e.g., lending)
  /utils          # Helpers and utility functions
  /validators     # Input validation logic
  /tests          # Unit and integration tests
/server.js        # App entry point
```

### What are potential stretch challenges that you could implement to go above and beyond?

- Implementing file uploads
- Implementing file downloads

---

## API Endpoint Planning

### User

- `POST /users`: Create a new user  
- `GET /users/login`: User login (returns token)  
- `GET /users/logout`: User logout  
- `GET /users/{userId}`: Get user details  
- `PUT /users/{userId}`: Update user  
- `DELETE /users/{userId}`: Delete user  

### Book

- `POST /books`: Add book  
- `GET /books`: Get all books (with filters)  
- `GET /books/{bookId}`: Get book details  
- `PUT /books/{bookId}`: Update book  
- `DELETE /books/{bookId}`: Delete book  

### Lending Records

- `POST /lending`: Create lending record  
- `GET /lending`: Get all records (with filters)  
- `GET /lending/{recordId}`: Get record  
- `PUT /lending/{recordId}`: Update record  
- `DELETE /lending/{recordId}`: Delete record  

### Staff

- `POST /staff`: Add staff  
- `GET /staff`: List staff  
- `GET /staff/{staffId}`: Staff details  
- `PUT /staff/{staffId}`: Update staff  
- `DELETE /staff/{staffId}`: Delete staff  

---

## Project Scheduling and Delegation

### Weekly Tasks

- **Week 04**: Project Proposal  
- **Week 05**:  
  - Create Git Repo  
  - Push to Heroku  
  - API documentation available at `/api-docs`  
  - Deploy to Render  
- **Week 06**: Check and fix errors  
- **Week 07**: Video Presentation  

### Task Delegation

- **Users endpoints**: Joseph Israel  
- **Staff endpoints**: Andrew Obinna Onyekwere  
- **Book endpoints**: Clementine Iradukunda  
- **Lending records**: Cristobal Henriquez  
- **Staff authentication**: Andrew  
- **User authentication**: Joseph  
- **Deployment to Render**: Andrew  
- **Node.js project setup**: Cristobal  
- **Git repo setup**: Clementine  
- **MongoDB setup**: Andrew  
- **API Swagger docs**: Farai Dandara  
- **Final video presentation**: Team effort  

---

## Potential Risks and Risk Mitigation Techniques

### Risks

- Time management issues
- Debugging unexpected errors

### Mitigation

- Regularly complete assigned tasks
- Fix errors before group meetings

---
