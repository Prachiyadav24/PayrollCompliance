import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function MyPayslips() {
  const [runs, setRuns] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/payroll/my-runs').then(res => setRuns(res.data));
  }, []);

  console.log(user)

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
              <td>{r.month}</td>
              <td>{r.year}</td>
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
