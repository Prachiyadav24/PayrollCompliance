import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PayrollRuns() {
  const [runs, setRuns] = useState([]);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRuns();
  }, []);

  async function fetchRuns() {
    const res = await api.get('/payroll/runs');
    setRuns(res.data);
  }

  async function createRun() {
    if (!month || !year) return alert('Month and year required');

    await api.post('/payroll/run', {
      month: Number(month),
      year: Number(year)
    });

    setMonth('');
    setYear('');
    fetchRuns();
  }

  return (
    <div className="page" style={{ padding: 20 }}>
      <h2>Payroll Runs</h2>

      {user.role === 'ADMIN' && (
        <div style={{ marginBottom: 20 }}>
          <input
            placeholder="Month (1-12)"
            value={month}
            onChange={e => setMonth(e.target.value)}
          />
          <input
            placeholder="Year"
            value={year}
            onChange={e => setYear(e.target.value)}
          />
          <button onClick={createRun}>Create Run</button>
        </div>
      )}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Month</th>
            <th>Year</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {runs.map(run => (
            <tr key={run.id}>
              <td>{run.month}</td>
              <td>{run.year}</td>
              <td>{run.status}</td>
              <td>
                <button onClick={() => navigate(`/payroll/run/${run.id}`)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
