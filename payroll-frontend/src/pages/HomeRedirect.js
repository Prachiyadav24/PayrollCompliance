import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomeRedirect() {
  const { user } = useAuth();

  if (user.role === 'EMPLOYEE') {
    return <Navigate to="/my-payslips" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/payroll/runs" replace />;
  }

  if (user.role === 'ACCOUNTANT') {
    return <Navigate to="/reports" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
}
