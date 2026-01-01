import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function PayrollRunDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [run, setRun] = useState(null);

  useEffect(() => {
    fetchRun();
  }, []);

  async function fetchRun() {
    const res = await api.get(`/payroll/run/${id}`);
    setRun(res.data);
  }

  async function action(url) {
    await api.post(url);
    fetchRun();
  }

  if (!run) return null;

  const isAdmin = user.role === 'ADMIN';
  const isDraft = run.status === 'DRAFT';

  return (
    <div className="page"style={{ padding: 20 }}>
      <h2>
        Payroll Run – {run.month}/{run.year} ({run.status})
      </h2>

      {isAdmin && isDraft && (
        <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
          <button disabled={!isDraft} onClick={() => action(`/payroll/calculate/${run.id}`)}>
            Calculate Gross
          </button>
          <button disabled={!isDraft} onClick={() => action(`/payroll/calculate-pf/${run.id}`)}>
            PF
          </button>
          <button disabled={!isDraft} onClick={() => action(`/payroll/calculate-esi/${run.id}`)}>
            ESI
          </button>
          <button disabled={!isDraft} onClick={() => action(`/payroll/calculate-pt/${run.id}`)}>
            PT
          </button>
          <button disabled={!isDraft} onClick={() => action(`/payroll/calculate-tds/${run.id}`)}>
            TDS
          </button>
          <button disabled={!isDraft} onClick={() => action(`/payroll/calculate-net/${run.id}`)}>
            Net Pay
          </button>
          <button onClick={() => action(`/payroll/finalize/${run.id}`)}>
            Finalize
          </button>
        </div>
      )}

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Emp ID</th>
            <th>Name</th>
            <th>Gross</th>
            <th>PF</th>
            <th>ESI</th>
            <th>PT</th>
            <th>TDS</th>
            <th>Net</th>
            <th>Payslip</th>
          </tr>
        </thead>
        <tbody>
          {run.PayrollEntries.map(e => (
            <tr key={e.id}>
              <td>{e.Employee.employeeCode}</td>
              <td>{e.Employee.name}</td>
              <td>{e.grossPay}</td>
              <td>{e.StatutoryDeduction?.pfEmployee || 0}</td>
              <td>{e.StatutoryDeduction?.esiEmployee || 0}</td>
              <td>{e.StatutoryDeduction?.professionalTax || 0}</td>
              <td>{e.StatutoryDeduction?.tds || 0}</td>
              <td>{e.netPay}</td>
              <td>
                {run.status === 'FINALIZED' && (
                    <>
                    <a
                        href={`http://localhost:3000/api/payslips/${run.id}/${e.Employee.id}`}
                        target="_blank"
                        rel="noreferrer"
                        >
                        View
                        </a>
                        &nbsp;|&nbsp;
                       <a
                        href={`http://localhost:3000/api/payslips/${run.id}/${e.Employee.id}?download=true`}
                        >
                        Download
                        </a>

                    </>
                )}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
