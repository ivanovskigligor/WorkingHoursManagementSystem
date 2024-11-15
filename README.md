## How to Test the Application

Follow the steps below to test the application:

### 1. Clone the Project
Clone the repository to your local machine:
```bash
git clone(https://github.com/ivanovskigligor/WorkingHoursManagementSystem.git)
```

### 2. Setup the Backend (Server)
1. Navigate to the `server` folder:
   ```bash
   cd server
   ```

2. Update the database connection string in `appsettings.json` as needed:
   ```json
   "ConnectionStrings": {
       "DefaultConnection": "Server={YourDbServerName};Database=EmployeeDatabase;Trusted_Connection=True;TrustServerCertificate=true"
   }
   ```

3. Restore dependencies and update the database:
   ```bash
   dotnet restore
   dotnet ef database update
   ```

### 3. Setup the Frontend (Client)
1. Navigate to the `client` folder:
   ```bash
   cd client
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

### 4. Run the Project

### 5. Access the Application
1. Open your browser to the frontend's development URL (e.g., `http://localhost:5173`).
2. Login using the credentials:
   - **Username:** `admin`
   - **Password:** `SecurePassword!23`

---
## Technologies Used
- **Backend**: ASP.NET Core
- **Frontend**: React
- **Database**: SQL Server

