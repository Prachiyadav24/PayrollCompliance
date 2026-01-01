import { useState } from 'react';
import api from '../api';

export default function EmployeeUpload() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  async function upload() {
    if (!file) return alert('Select a file');

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await api.post('/employees/upload', form);
      setMsg(`Uploaded ${res.data.count} employees`);
    } catch (e) {
      setMsg(
        e.response?.data?.errors?.join(', ') ||
        e.response?.data?.error ||
        'Upload failed'
      );
    }
  }

  return (
    <div className='page' style={{ padding: 20 }}>
      <h2>Employee Master Upload</h2>

      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={e => setFile(e.target.files[0])}
      />

      <br />
      <button onClick={upload}>Upload</button>

      {msg && <p>{msg}</p>}
    </div>
  );
}
