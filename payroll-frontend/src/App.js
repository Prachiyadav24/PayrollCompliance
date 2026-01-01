import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PayrollRuns from './pages/PayrollRuns';
import { Navigate } from 'react-router-dom';
import PayrollRunDetail from './pages/PayrollRunDetail';
import EmployeeUpload from './pages/EmployeeUpload';
import AttendanceUpload from './pages/AttendanceUpload';
import MyPayslips from './pages/MyPayslips';
import HomeRedirect from './pages/HomeRedirect';

function Dashboard() {
  return <h1>Dashboard</h1>;
}

function Unauthorized() {
  return <h2>Unauthorized</h2>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                    <HomeRedirect />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payroll/runs"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <PayrollRuns />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/payroll/run/:id"
            element={
              <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
                <PayrollRunDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/upload"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <EmployeeUpload />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance/upload"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AttendanceUpload />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-payslips"
            element={
              <ProtectedRoute roles={['EMPLOYEE']}>
                <MyPayslips />
              </ProtectedRoute>
            }
          />

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
