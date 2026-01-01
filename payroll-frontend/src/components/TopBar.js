import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
    navigate('/login');
  }

  if (!user) return null;

  return (
    <div
    style={{
        display: 'flex',
        gap: 20,
        padding: '12px 24px',
        background: 'white',
        borderBottom: '1px solid #ddd',
        alignItems: 'center'
    }}
    >

      <strong>Payroll System</strong>


      {user.role === 'ADMIN' && (
          <>
          <Link to="/payroll/runs">Payroll Runs</Link>
          <Link to="/employees/upload">Employee Upload</Link>
          <Link to="/attendance/upload">Attendance Upload</Link>
        </>
      )}

      {(user.role === 'ADMIN' || user.role === 'ACCOUNTANT') && (
        <>
          <Link to="/reports">Reports</Link>
        </>
      )}

      {user.role === 'EMPLOYEE' && (
        <Link to="/my-payslips">My Payslips</Link>
        )}


      <div style={{ marginLeft: 'auto' }}>
        <span
        style={{
            marginRight: 10,
            padding: '2px 6px',
            background: '#eef2ff',
            borderRadius: 4,
            fontSize: 12
        }}
        >
        {user.role}
        </span>

        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
