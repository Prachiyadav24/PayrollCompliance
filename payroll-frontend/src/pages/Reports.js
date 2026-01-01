import { useEffect, useState } from 'react';
import api from '../api';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function Reports() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    api.get('/payroll/runs').then(res => setRuns(res.data));
  }, []);

  return (
    <div className="page">
      <h2>Reports</h2>

      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Year</th>
            <th>Status</th>
            <th>Payroll</th>
            <th>PF</th>
            <th>ESI</th>
          </tr>
        </thead>

        <tbody>
          {runs.map(run => (
            <tr key={run.id}>
              <td>{MONTH_NAMES[run.month - 1]}</td>
              <td>{2000 + run.year}</td>
              <td>{run.status}</td>

              <td>
                <a
                  href={`http://localhost:3000/api/reports/payroll-register/${run.id}`}
                >
                  Download
                </a>
              </td>

              <td>
                <a
                  href={`http://localhost:3000/api/reports/pf-register/${run.id}`}
                >
                  Download
                </a>
              </td>

              <td>
                <a
                  href={`http://localhost:3000/api/reports/esi-register/${run.id}`}
                >
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
