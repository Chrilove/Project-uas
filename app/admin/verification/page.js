'use client';
import Sidebar from '../../components/Sidebar'

export default function VerificationPage() {
  const verifications = [
    {
      id: '#VER001',
      reseller: 'Sari Beauty Store',
      email: 'sari@beauty.com',
      businessName: 'Sari Beauty Store',
      phone: '+62 812-3456-7890',
      submitDate: '25 Mei 2025',
      documentType: 'KTP & SIUP',
      status: 'pending'
    },
    {
      id: '#VER002',
      reseller: 'Cantik Cosmetics',
      email: 'cantik@cosmet.com',
      businessName: 'Cantik Cosmetics Shop',
      phone: '+62 813-5678-9012',
      submitDate: '24 Mei 2025',
      documentType: 'KTP & NIB',
      status: 'approved'
    },
    {
      id: '#VER003',
      reseller: 'Glowing Skin Shop',
      email: 'glow@skin.com',
      businessName: 'Glowing Skin Care',
      phone: '+62 814-9876-5432',
      submitDate: '23 Mei 2025',
      documentType: 'KTP & NPWP',
      status: 'rejected'
    },
    {
      id: '#VER004',
      reseller: 'Natural Beauty Co',
      email: 'natural@beauty.co',
      businessName: 'Natural Beauty Indonesia',
      phone: '+62 815-1234-5678',
      submitDate: '22 Mei 2025',
      documentType: 'KTP & SIUP',
      status: 'under_review'
    },
    {
      id: '#VER005',
      reseller: 'Beauty Corner',
      email: 'corner@beauty.id',
      businessName: 'Beauty Corner Store',
      phone: '+62 816-2468-1357',
      submitDate: '21 Mei 2025',
      documentType: 'KTP & NIB',
      status: 'pending'
    }
  ]

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="status-badge status-pending">Menunggu</span>
      case 'under_review':
        return <span className="status-badge status-review">Sedang Ditinjau</span>
      case 'approved':
        return <span className="status-badge status-approved">Disetujui</span>
      case 'rejected':
        return <span className="status-badge status-rejected">Ditolak</span>
      default:
        return <span className="status-badge">{status}</span>
    }
  }

  const handleApprove = (verificationId) => {
    console.log(`Approving verification ${verificationId}`)
  }

  const handleReject = (verificationId) => {
    console.log(`Rejecting verification ${verificationId}`)
  }

  const handleViewDetails = (verificationId) => {
    console.log(`Viewing details for verification ${verificationId}`)
  }

  const handleStartReview = (verificationId) => {
    console.log(`Starting review for verification ${verificationId}`)
  }

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Verifikasi Reseller</h2>
          <div>
            <select className="form-select" style={{width: 'auto', display: 'inline-block'}}>
              <option>Semua Status</option>
              <option>Menunggu</option>
              <option>Sedang Ditinjau</option>
              <option>Disetujui</option>
              <option>Ditolak</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="summary-card">
              <div className="summary-icon bg-warning">⏳</div>
              <div className="summary-info">
                <h4>12</h4>
                <p>Menunggu Verifikasi</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="summary-card">
              <div className="summary-icon bg-info">🔍</div>
              <div className="summary-info">
                <h4>8</h4>
                <p>Sedang Ditinjau</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="summary-card">
              <div className="summary-icon bg-success">✅</div>
              <div className="summary-info">
                <h4>145</h4>
                <p>Disetujui</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="summary-card">
              <div className="summary-icon bg-danger">❌</div>
              <div className="summary-info">
                <h4>23</h4>
                <p>Ditolak</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="table-container">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>ID Verifikasi</th>
                  <th>Reseller</th>
                  <th>Nama Bisnis</th>
                  <th>Kontak</th>
                  <th>Tanggal Submit</th>
                  <th>Dokumen</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((verification) => (
                  <tr key={verification.id}>
                    <td className="fw-bold text-primary">{verification.id}</td>
                    <td>
                      <div>{verification.reseller}</div>
                      <small className="text-muted">{verification.email}</small>
                    </td>
                    <td>{verification.businessName}</td>
                    <td>
                      <div>{verification.phone}</div>
                      <small className="text-muted">{verification.email}</small>
                    </td>
                    <td>{verification.submitDate}</td>
                    <td>
                      <span className="document-badge">{verification.documentType}</span>
                    </td>
                    <td>{getStatusBadge(verification.status)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDetails(verification.id)}
                        >
                          Detail
                        </button>
                        {verification.status === 'pending' && (
                          <button 
                            className="btn btn-sm btn-info"
                            onClick={() => handleStartReview(verification.id)}
                          >
                            Tinjau
                          </button>
                        )}
                        {verification.status === 'under_review' && (
                          <>
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handleApprove(verification.id)}
                            >
                              Setujui
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleReject(verification.id)}
                            >
                              Tolak
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <span className="text-muted">
            Menampilkan {verifications.length} dari 188 verifikasi
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <span className="page-link">Previous</span>
              </li>
              <li className="page-item active">
                <span className="page-link">1</span>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">2</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">3</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <style jsx>{`
        .table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .summary-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .summary-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .summary-info h4 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
          color: #495057;
        }

        .summary-info p {
          margin: 0.25rem 0 0 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-review {
          background-color: #d1ecf1;
          color: #0c5460;
        }

        .status-approved {
          background-color: #d1ecf1;
          color: #0c5460;
        }

        .status-rejected {
          background-color: #f8d7da;
          color: #721c24;
        }

        .document-badge {
          background-color: #e9ecef;
          color: #495057;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .table th {
          border-top: none;
          font-weight: 600;
          color: #495057;
        }

        .table td {
          vertical-align: middle;
        }

        .main-content {
          margin-left: 250px;
          padding: 2rem;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        .row {
          display: flex;
          flex-wrap: wrap;
          margin: -0.5rem;
        }

        .col-md-3 {
          flex: 0 0 25%;
          max-width: 25%;
          padding: 0.5rem;
        }

        .d-flex {
          display: flex;
        }

        .justify-content-between {
          justify-content: space-between;
        }

        .align-items-center {
          align-items: center;
        }

        .gap-2 {
          gap: 0.5rem;
        }

        .mb-4 {
          margin-bottom: 1.5rem;
        }

        .mt-4 {
          margin-top: 1.5rem;
        }

        .fw-bold {
          font-weight: bold;
        }

        .text-primary {
          color: #007bff;
        }

        .text-muted {
          color: #6c757d;
        }

        .btn {
          padding: 0.375rem 0.75rem;
          border-radius: 4px;
          border: 1px solid;
          cursor: pointer;
          font-size: 0.875rem;
          text-decoration: none;
          display: inline-block;
        }

        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }

        .btn-outline-primary {
          color: #007bff;
          border-color: #007bff;
          background: white;
        }

        .btn-outline-primary:hover {
          background: #007bff;
          color: white;
        }

        .btn-success {
          background: #28a745;
          border-color: #28a745;
          color: white;
        }

        .btn-success:hover {
          background: #218838;
          border-color: #1e7e34;
        }

        .btn-danger {
          background: #dc3545;
          border-color: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
          border-color: #bd2130;
        }

        .btn-info {
          background: #17a2b8;
          border-color: #17a2b8;
          color: white;
        }

        .btn-info:hover {
          background: #138496;
          border-color: #117a8b;
        }

        .form-select {
          padding: 0.375rem 0.75rem;
          border: 1px solid #ced4da;
          border-radius: 4px;
          background: white;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table-hover tbody tr:hover {
          background-color: rgba(0,0,0,0.05);
        }

        .table-light {
          background-color: #f8f9fa;
        }

        .table th, .table td {
          padding: 0.75rem;
          border-bottom: 1px solid #dee2e6;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .pagination {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .pagination-sm .page-link {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }

        .page-item .page-link {
          padding: 0.375rem 0.75rem;
          margin-left: -1px;
          color: #007bff;
          background-color: #fff;
          border: 1px solid #dee2e6;
          text-decoration: none;
        }

        .page-item.active .page-link {
          background-color: #007bff;
          border-color: #007bff;
          color: white;
        }

        .page-item.disabled .page-link {
          color: #6c757d;
          background-color: #fff;
          border-color: #dee2e6;
          cursor: not-allowed;
        }

        .mb-0 {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            padding: 1rem;
          }

          .col-md-3 {
            flex: 0 0 100%;
            max-width: 100%;
          }

          .d-flex {
            flex-direction: column;
            gap: 1rem;
          }

          .table-responsive {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </>
  )
}