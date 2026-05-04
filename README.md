# Doctor Dispensary Application

A comprehensive healthcare management system consisting of two integrated applications:
- **DispensaPro**: React-based frontend application for user interface
- **Dispensary**: Spring Boot backend application for business logic and data management

## Architecture Overview

This monorepo contains both frontend and backend applications that work together to provide a complete dispensary management solution.

```
doctor-dispensary-application-2.1/
├── dispensapro/          # React Frontend Application
├── dispensary/           # Spring Boot Backend Application
└── README.md            # This file
```

## Applications

### 🖥️ DispensaPro (Frontend)

**Technology Stack:**
- React 19.1.1
- TypeScript
- Material-UI (MUI) v7
- Redux Toolkit
- React Router
- Axios for API calls
- Formik + Yup for forms

**Features:**
- Modern, responsive user interface
- Patient management
- Prescription management
- Medicine inventory tracking
- Billing and invoicing
- Real-time updates with React Hot Toast

**Getting Started:**
```bash
cd dispensapro
npm install
npm start
```

**Development Server:** http://localhost:3000

### ⚙️ Dispensary (Backend)

**Technology Stack:**
- Java 17
- Spring Boot 3.x
- Spring Security
- JPA/Hibernate
- H2 Database (development)
- Maven

**Features:**
- RESTful API endpoints
- Multi-tenant architecture
- Role-based access control
- Comprehensive exception handling
- Data validation and business rules
- Queue management system
- Stock and supply tracking

**Getting Started:**
```bash
cd dispensary
./mvnw spring-boot:run
```

**API Server:** http://localhost:8080

## API Documentation

The backend provides comprehensive REST API endpoints for:

- **Patient Management**: `/api/patients`
- **Prescription Management**: `/api/prescriptions`
- **Medicine Management**: `/api/medicines`
- **Stock Management**: `/api/stock`
- **Billing**: `/api/bills`
- **Queue Management**: `/api/queue`
- **User Management**: `/api/users`
- **Tenant Management**: `/api/tenants`

## Database Schema

The application uses a relational database with the following main entities:

- **Patients**: Patient information and demographics
- **Prescriptions**: Medical prescriptions and items
- **Medicines**: Drug inventory and details
- **Stock**: Medicine stock levels and batches
- **Supplies**: Supply chain management
- **Bills**: Billing and payment information
- **Users**: System users and authentication
- **Tenants**: Multi-tenant support

## Security Features

- JWT-based authentication
- Role-based authorization (Admin, Doctor, Pharmacist, Staff)
- Multi-tenant data isolation
- Password encryption
- API endpoint security

## Development Workflow

### Prerequisites
- Node.js 18+ (for frontend)
- Java 17+ (for backend)
- Maven 3.6+

### Running Both Applications

1. **Start the Backend:**
   ```bash
   cd dispensary
   ./mvnw spring-boot:run
   ```

2. **Start the Frontend:**
   ```bash
   cd dispensapro
   npm start
   ```

3. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - H2 Console: http://localhost:8080/h2-console

### Testing

**Frontend Tests:**
```bash
cd dispensapro
npm test
```

**Backend Tests:**
```bash
cd dispensary
./mvnw test
```

## Project Structure

### Frontend (dispensapro/)
```
src/
├── components/     # Reusable UI components
├── features/       # Feature-specific components
├── assets/         # Static assets
├── App.tsx         # Main application component
└── index.tsx       # Application entry point
```

### Backend (dispensary/)
```
src/main/java/com/anucode/dispensary/
├── controllers/    # REST API controllers
├── services/       # Business logic services
├── repos/          # JPA repositories
├── entities/       # JPA entities
├── dto/           # Data transfer objects
├── exception/     # Custom exceptions
├── filters/       # Security filters
└── utilities/     # Utility classes
```

## Environment Configuration

### Backend (application.properties)
```properties
# Database Configuration
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop

# Server Configuration
server.port=8080
```

### Frontend Environment Variables
Create `.env` file in `dispensapro/`:
```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

### Frontend Deployment
```bash
cd dispensapro
npm run build
```
Deploy the `build/` folder to your web server.

### Backend Deployment
```bash
cd dispensary
./mvnw clean package
java -jar target/dispensary-0.0.1-SNAPSHOT.jar
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a healthcare management system designed for dispensary operations. Please ensure compliance with local healthcare regulations and data protection requirements when deploying in production environments.
