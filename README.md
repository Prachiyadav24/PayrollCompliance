# Payroll Management System

A full-stack payroll management system built with **Node.js, Express, SQLite/MySQL**, and **React**, designed to handle real-world payroll workflows including attendance ingestion, statutory calculations, payslips, and role-based access control.

This project focuses on **correctness, auditability, and separation of concerns**, not flashy UI.

---

## Features

### User Roles
- **Admin / HR**
  - Upload employee master data
  - Upload attendance sheets
  - Create and run payroll
  - Execute statutory calculations (PF, ESI, PT, TDS)
  - Finalize payroll
  - Download reports and payslips

- **Accountant**
  - View payroll runs
  - Download statutory reports (PF, ESI, Payroll Register)
  - View payslips (read-only)

- **Employee**
  - View and download own payslips
  - Access only finalized payroll data

---

## Payroll Capabilities

- Employee master ingestion from Excel
- Attendance ingestion from Excel (month/year parsed from file)
- Payroll run lifecycle:
  - DRAFT → FINALIZED
- Step-by-step calculations:
  - Gross pay
  - PF (employee + employer)
  - ESI (employee + employer)
  - Professional Tax
  - TDS (simplified annualized model)
  - Net pay
- Payslip generation (PDF)
- CSV exports:
  - Payroll Register
  - PF Register
  - ESI Register

---

## Tech Stack

### Backend
- Node.js
- Express
- Sequelize ORM
- SQLite (development)
- MySQL/Postgres ready
- Session-based authentication
- PDF generation using pdfkit

### Frontend
- React
- React Router
- Axios
- Session-based auth (HTTP-only cookies)
- Role-aware navigation

---

## Authentication & Security

- Server-side sessions (no JWTs)
- Role-based access control enforced on backend
- Employees can only access their own data
- Payroll data is immutable after finalization

---

## Project Structure (Simplified)

