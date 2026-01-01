import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function MyPayslips() {
  const [runs, setRuns] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/payroll/my-runs').then(res => setRuns(res.data));
  }, []);

  const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="page">
      <h2>My Payslips</h2>

      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Year</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {runs.map(r => (
            <tr key={r.runId}>
              <td>{MONTH_NAMES[r.month - 1]}</td>
              <td>{r.year < 100 ? 2000 + r.year : r.year}</td>
              <td>{r.status}</td>
              <td>
                {r.status === 'FINALIZED' ? (
                  <a
                    href={`http://localhost:3000/api/payslips/${r.runId}/${user.employeeId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Payslip
                  </a>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
