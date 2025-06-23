'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { 
  getAllShipments, 
  createShipmentFromOrder,
  updateShipmentStatus,
  deleteShipment,
  getShipmentStats 
} from '../../lib/shipments';
import { getAllOrders } from '../../lib/orders';

export default function ShippingPage() {
  const [shipments, setShipments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalShipments: 0,
    inTransit: 0,
    delivered: 0,
    totalCost: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    orderId: '',
    courier: 'JNE',
    service: 'REG',
    cost: '',
    estimatedDays: '2-3 hari',
    trackingNumber: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shipmentsResult, ordersResult, statsResult] = await Promise.all([
        getAllShipments(),
        getAllOrders(),
        getShipmentStats()
      ]);

      if (shipmentsResult.success) {
        setShipments(shipmentsResult.shipments);
      }

      if (ordersResult.success) {
        // Filter orders that are confirmed and don't have shipments yet
        const confirmedOrders = ordersResult.orders.filter(order => 
          order.status === 'confirmed' || order.paymentStatus === 'paid'
        );
        setOrders(confirmedOrders);
      }

      if (statsResult.success) {
        setStats(statsResult.stats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    
    if (!formData.orderId) {
      alert('Pilih pesanan terlebih dahulu');
      return;
    }

    const selectedOrder = orders.find(order => order.id === formData.orderId);
    if (!selectedOrder) {
      alert('Pesanan tidak ditemukan');
      return;
    }

    const shippingData = {
      courier: formData.courier,
      service: formData.service,
      cost: parseFloat(formData.cost) || 0,
      estimatedDays: formData.estimatedDays,
      trackingNumber: formData.trackingNumber,
      notes: formData.notes
    };

    const result = await createShipmentFromOrder(selectedOrder, shippingData);
    
    if (result.success) {
      alert('Pengiriman berhasil dibuat!');
      setShowModal(false);
      resetForm();
      loadData();
    } else {
      alert('Gagal membuat pengiriman: ' + result.error);
    }
  };

  const handleUpdateStatus = async (shipmentId, newStatus) => {
    const result = await updateShipmentStatus(shipmentId, newStatus);
    if (result.success) {
      alert('Status pengiriman berhasil diupdate!');
      loadData();
    } else {
      alert('Gagal update status: ' + result.error);
    }
  };

  const handleDeleteShipment = async (shipmentId) => {
    if (confirm('Yakin ingin menghapus pengiriman ini?')) {
      const result = await deleteShipment(shipmentId);
      if (result.success) {
        alert('Pengiriman berhasil dihapus!');
        loadData();
      } else {
        alert('Gagal hapus pengiriman: ' + result.error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      orderId: '',
      courier: 'JNE',
      service: 'REG',
      cost: '',
      estimatedDays: '2-3 hari',
      trackingNumber: '',
      notes: ''
    });
    setEditingShipment(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      preparing: { class: 'bg-warning text-dark', text: 'Mempersiapkan' },
      in_transit: { class: 'bg-primary', text: 'Dalam Perjalanan' },
      delivered: { class: 'bg-success', text: 'Terkirim' },
      returned: { class: 'bg-danger', text: 'Dikembalikan' },
      cancelled: { class: 'bg-secondary', text: 'Dibatalkan' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return `<span class="badge ${config.class}">${config.text}</span>`;
  };

  const formatCurrency = (amount) => {
    if (typeof amount === 'string') {
      if (amount.includes('Rp')) return amount;
      amount = parseFloat(amount);
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredShipments = statusFilter === 'all' 
    ? shipments 
    : shipments.filter(shipment => shipment.status === statusFilter);

  return (
    <div className="d-flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="main-content">
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h4 mb-0">🚚 Manajemen Pengiriman</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  + Buat Pengiriman Baru
                </button>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Memuat data pengiriman...</p>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="row mb-4">
                    <div className="col-lg-3 col-md-6 mb-3">
                      <div className="card bg-primary text-white h-100">
                        <div className="card-body text-center">
                          <h3 className="card-title">📦</h3>
                          <h4>{stats.totalShipments}</h4>
                          <p className="card-text">Total Pengiriman</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-3">
                      <div className="card bg-warning text-dark h-100">
                        <div className="card-body text-center">
                          <h3 className="card-title">🚛</h3>
                          <h4>{stats.inTransit}</h4>
                          <p className="card-text">Dalam Perjalanan</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-3">
                      <div className="card bg-success text-white h-100">
                        <div className="card-body text-center">
                          <h3 className="card-title">✅</h3>
                          <h4>{stats.delivered}</h4>
                          <p className="card-text">Terkirim</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-3">
                      <div className="card bg-info text-white h-100">
                        <div className="card-body text-center">
                          <h3 className="card-title">💰</h3>
                          <h4 className="small-text">{formatCurrency(stats.totalCost)}</h4>
                          <p className="card-text">Total Biaya</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filter and Actions */}
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <select 
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">Semua Status</option>
                        <option value="preparing">Mempersiapkan</option>
                        <option value="in_transit">Dalam Perjalanan</option>
                        <option value="delivered">Terkirim</option>
                        <option value="returned">Dikembalikan</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                    </div>
                    <div className="col-md-8 text-end">
                      <button className="btn btn-primary" onClick={loadData}>
                        🔄 Refresh
                      </button>
                    </div>
                  </div>

                  {/* Shipments Table */}
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">Daftar Pengiriman</h5>
                    </div>
                    <div className="card-body">
                      {filteredShipments.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-muted">Tidak ada data pengiriman</p>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead className="table-light">
                              <tr>
                                <th>No. Pengiriman</th>
                                <th>No. Pesanan</th>
                                <th>Reseller</th>
                                <th>Kurir</th>
                                <th>Alamat Tujuan</th>
                                <th>Biaya</th>
                                <th>Status</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredShipments.map((shipment) => (
                                <tr key={shipment.id}>
                                  <td>
                                    <strong>{shipment.shipmentNumber}</strong>
                                    {shipment.trackingNumber && (
                                      <div className="text-muted small">
                                        Resi: {shipment.trackingNumber}
                                      </div>
                                    )}
                                  </td>
                                  <td>#{shipment.orderNumber}</td>
                                  <td>
                                    <div>{shipment.resellerName}</div>
                                    <div className="text-muted small">{shipment.resellerEmail}</div>
                                  </td>
                                  <td>
                                    <div>{shipment.courier} - {shipment.service}</div>
                                    <div className="text-muted small">Est: {shipment.estimatedDays}</div>
                                  </td>
                                  <td>
                                    <div>{shipment.shippingAddress?.recipientName || 'N/A'}</div>
                                    <div className="text-muted small">
                                      {shipment.shippingAddress?.city || 'N/A'}, {shipment.shippingAddress?.province || 'N/A'}
                                    </div>
                                  </td>
                                  <td className="fw-bold text-success">{formatCurrency(shipment.cost)}</td>
                                  <td>
                                    <div dangerouslySetInnerHTML={{ __html: getStatusBadge(shipment.status) }} />
                                  </td>
                                  <td>{formatDate(shipment.createdAt)}</td>
                                  <td>
                                    <div className="btn-group btn-group-sm">
                                      <select 
                                        className="form-select form-select-sm"
                                        value={shipment.status}
                                        onChange={(e) => handleUpdateStatus(shipment.id, e.target.value)}
                                      >
                                        <option value="preparing">Mempersiapkan</option>
                                        <option value="in_transit">Dalam Perjalanan</option>
                                        <option value="delivered">Terkirim</option>
                                        <option value="returned">Dikembalikan</option>
                                        <option value="cancelled">Dibatalkan</option>
                                      </select>
                                      <button 
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDeleteShipment(shipment.id)}
                                        title="Hapus Pengiriman"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Create Shipment Modal */}
        {showModal && (
          <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Buat Pengiriman Baru</h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  ></button>
                </div>
                <form onSubmit={handleCreateShipment}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Pilih Pesanan *</label>
                          <select 
                            className="form-select"
                            value={formData.orderId}
                            onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                            required
                          >
                            <option value="">-- Pilih Pesanan --</option>
                            {orders.map(order => (
                              <option key={order.id} value={order.id}>
                                #{order.orderNumber} - {order.resellerName} ({formatCurrency(order.totalAmount)})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Kurir</label>
                          <select 
                            className="form-select"
                            value={formData.courier}
                            onChange={(e) => setFormData({...formData, courier: e.target.value})}
                          >
                            <option value="JNE">JNE</option>
                            <option value="JNT">J&T Express</option>
                            <option value="POS">Pos Indonesia</option>
                            <option value="TIKI">TIKI</option>
                            <option value="SiCepat">SiCepat</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Layanan</label>
                          <select 
                            className="form-select"
                            value={formData.service}
                            onChange={(e) => setFormData({...formData, service: e.target.value})}
                          >
                            <option value="REG">Regular</option>
                            <option value="YES">Yes (1 hari)</option>
                            <option value="OKE">OKE (2-3 hari)</option>
                            <option value="EXPRESS">Express</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Biaya Pengiriman</label>
                          <input 
                            type="number"
                            className="form-control"
                            value={formData.cost}
                            onChange={(e) => setFormData({...formData, cost: e.target.value})}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Estimasi Pengiriman</label>
                          <input 
                            type="text"
                            className="form-control"
                            value={formData.estimatedDays}
                            onChange={(e) => setFormData({...formData, estimatedDays: e.target.value})}
                            placeholder="2-3 hari"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Nomor Resi</label>
                          <input 
                            type="text"
                            className="form-control"
                            value={formData.trackingNumber}
                            onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
                            placeholder="Kosongkan jika belum ada"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Catatan</label>
                      <textarea 
                        className="form-control"
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Catatan tambahan untuk pengiriman..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                    >
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Buat Pengiriman
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .main-content {
          margin-left: 250px;
          min-height: 100vh;
          transition: margin-left 0.3s ease;
          width: calc(100% - 250px);
        }

        @media (max-width: 767.98px) {
          .main-content {
            margin-left: 0;
            width: 100%;
            padding-top: 70px;
          }
        }

        @media (max-width: 1024px) and (min-width: 768px) {
          .main-content {
            margin-left: 200px;
            width: calc(100% - 200px);
          }
        }

        .card {
          border: none;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border-radius: 0.375rem;
        }

        .card-body {
          padding: 1.5rem;
        }

        .card-header {
          background-color: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          padding: 1rem 1.5rem;
          border-radius: 0.375rem 0.375rem 0 0;
        }

        .table-responsive {
          border-radius: 0.375rem;
        }

        .badge {
          font-size: 0.75rem;
          padding: 0.35em 0.65em;
        }

        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }

        .form-select-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }

        .small-text {
          font-size: 0.9rem;
        }

        .modal-content {
          border: none;
          border-radius: 0.5rem;
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
        }

        .modal-header {
          border-bottom: 1px solid #dee2e6;
          padding: 1rem 1.5rem;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          border-top: 1px solid #dee2e6;
          padding: 1rem 1.5rem;
        }

        /* Responsive adjustments for cards */
        @media (max-width: 767.98px) {
          .card-body {
            padding: 1rem;
          }
          
          .h4 {
            font-size: 1.1rem;
          }
          
          .badge {
            font-size: 0.7rem;
          }
          
          .small-text {
            font-size: 0.8rem;
          }
        }

        /* Responsive table */
        @media (max-width: 991.98px) {
          .table-responsive {
            font-size: 0.875rem;
          }
          
          .table th,
          .table td {
            padding: 0.5rem;
          }
        }

        /* Button group spacing */
        .btn-group .btn {
          margin: 0;
        }

        .btn-group .form-select {
          border-radius: 0.375rem 0 0 0.375rem;
        }

        .btn-group .btn-outline-danger {
          border-radius: 0 0.375rem 0.375rem 0;
        }

        /* Prevent text overflow in table cells */
        .table td {
          word-wrap: break-word;
          max-width: 200px;
        }

        .table td .small {
          font-size: 0.8rem;
        }

        /* Loading state styling */
        .spinner-border {
          width: 3rem;
          height: 3rem;
        }
      `}</style>
    </div>
  );
}