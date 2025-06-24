'use client';

import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, updatePaymentStatus, deleteOrder } from '../../lib/orders';
import { formatCurrency } from '../../lib/payments';
import Sidebar from '../../components/Sidebar';
import Image from 'next/image';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await getAllOrders();
      if (result.success) {
        setOrders(result.orders);
      } else {
        console.error('Error loading orders:', result.error);
        alert('Error loading orders: ' + result.error);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  // Filter dan search orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.resellerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.resellerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      waiting_verification: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      completed: 0
    };

    orders.forEach(order => {
      if (order.status === 'pending') counts.pending++;
      if (order.paymentStatus === 'waiting_verification') counts.waiting_verification++;
      if (order.status === 'confirmed') counts.confirmed++;
      if (order.status === 'shipped') counts.shipped++;
      if (order.status === 'delivered') counts.delivered++;
      if (order.status === 'completed') counts.completed++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const handleStatusUpdate = async (orderId, newStatus, adminMessage = '') => {
    try {
      const result = await updateOrderStatus(orderId, newStatus, adminMessage);
      if (result.success) {
        await loadOrders();
        setShowModal(false);
        alert('Status berhasil diupdate!');
      } else {
        alert('Error updating status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const handlePaymentUpdate = async (orderId, paymentStatus, orderStatus = null, adminMessage = '') => {
    try {
      const result = await updatePaymentStatus(orderId, paymentStatus, orderStatus, adminMessage);
      if (result.success) {
        await loadOrders();
        setShowModal(false);
        alert('Status pembayaran berhasil diupdate!');
      } else {
        alert('Error updating payment: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error updating payment');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const result = await deleteOrder(orderId);
      if (result.success) {
        await loadOrders();
        setDeleteConfirm(null);
        alert('Order berhasil dihapus!');
      } else {
        alert('Error deleting order: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge bg-warning text-dark';
      case 'confirmed': return 'badge bg-info';
      case 'shipped': return 'badge bg-primary';
      case 'delivered': return 'badge bg-success';
      case 'completed': return 'badge bg-success';
      case 'cancelled': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  const getPaymentBadgeClass = (status) => {
    switch (status) {
      case 'waiting_payment': return 'badge bg-warning text-dark';
      case 'waiting_verification': return 'badge bg-info';
      case 'paid': return 'badge bg-success';
      case 'failed': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'waiting_payment': return 'Menunggu Pembayaran';
      case 'waiting_verification': return 'Menunggu Verifikasi';
      case 'paid': return 'Terbayar';
      case 'failed': return 'Gagal';
      default: return status;
    }
  };

  const getOrderStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu Pembayaran';
      case 'confirmed': return 'Dikonfirmasi';
      case 'shipped': return 'Dikirim';
      case 'delivered': return 'Sampai';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const showActionModal = (order, type) => {
    setSelectedOrder(order);
    setActionType(type);
    setShowModal(true);
  };

  const getAvailableActions = (order) => {
    const actions = [];

    actions.push({
      type: 'detail',
      text: '👁️ Lihat Detail',
      available: true
    });

    if (order.paymentStatus === 'waiting_verification') {
      actions.push({
        type: 'payment',
        text: '✅ Verifikasi Pembayaran',
        available: true,
        urgent: true
      });
    }

    if (!['completed', 'cancelled'].includes(order.status)) {
      actions.push({
        type: 'update',
        text: '📝 Update Status',
        available: true
      });
    }

    // Only allow delete for pending or cancelled orders
    if (['pending', 'cancelled'].includes(order.status)) {
      actions.push({
        type: 'delete',
        text: '🗑️ Hapus Order',
        available: true,
        danger: true
      });
    }

    return actions;
  };

  return (
    <>
      <style jsx>{`
        /* CSS Styling */
        .main-content {
          flex: 1;
          width: 100%;
          min-width: 0;
        }
        
        .container-fluid {
          max-width: none !important;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        
        .table {
          width: 100%;
          min-width: 1200px;
          table-layout: fixed;
        }
        
        .table th:nth-child(1), .table td:nth-child(1) {
          width: 12%; min-width: 120px;
        }
        .table th:nth-child(2), .table td:nth-child(2) {
          width: 15%; min-width: 150px;
        }
        .table th:nth-child(3), .table td:nth-child(3) {
          width: 18%; min-width: 180px;
        }
        .table th:nth-child(4), .table td:nth-child(4) {
          width: 12%; min-width: 120px;
        }
        .table th:nth-child(5), .table td:nth-child(5) {
          width: 12%; min-width: 120px;
        }
        .table th:nth-child(6), .table td:nth-child(6) {
          width: 12%; min-width: 120px;
        }
        .table th:nth-child(7), .table td:nth-child(7) {
          width: 12%; min-width: 120px;
        }
        .table th:nth-child(8), .table td:nth-child(8) {
          width: 7%; min-width: 80px;
        }
        
        @media (max-width: 1200px) {
          .table { min-width: 1000px; }
        }
        
        @media (max-width: 992px) {
          .table { min-width: 800px; }
          .container-fluid { padding-left: 0.5rem; padding-right: 0.5rem; }
        }
        
        .card { width: 100%; }
        .card-body { padding: 1.5rem; }
        .table td { word-wrap: break-word; vertical-align: middle; }
        .badge { white-space: nowrap; font-size: 0.75em; }
      `}</style>

      <div className="d-flex">
        <Sidebar />
        
        <div className="main-content">
          <div className="container-fluid py-4">
            <div className="row">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="h4 mb-0">🛒 Daftar Pemesanan</h2>
                  <div className="d-flex gap-2">
                    {statusCounts.waiting_verification > 0 && (
                      <div className="badge bg-danger text-white fs-6">
                        🚨 {statusCounts.waiting_verification} pembayaran perlu verifikasi!
                      </div>
                    )}
                    <button className="btn btn-primary" onClick={loadOrders}>
                      🔄 Refresh
                    </button>
                  </div>
                </div>

                {/* Status Cards */}
                <div className="row mb-4">
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card bg-warning text-dark h-100">
                      <div className="card-body text-center">
                        <h3 className="card-title">⏳</h3>
                        <h4>{statusCounts.pending}</h4>
                        <p className="card-text">Menunggu Bayar</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card bg-danger text-white h-100">
                      <div className="card-body text-center">
                        <h3 className="card-title">🚨</h3>
                        <h4>{statusCounts.waiting_verification}</h4>
                        <p className="card-text">Perlu Verifikasi</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card bg-info text-white h-100">
                      <div className="card-body text-center">
                        <h3 className="card-title">✅</h3>
                        <h4>{statusCounts.confirmed}</h4>
                        <p className="card-text">Diproses</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card bg-primary text-white h-100">
                      <div className="card-body text-center">
                        <h3 className="card-title">🚚</h3>
                        <h4>{statusCounts.shipped}</h4>
                        <p className="card-text">Dikirim</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card bg-secondary text-white h-100">
                      <div className="card-body text-center">
                        <h3 className="card-title">📦</h3>
                        <h4>{statusCounts.delivered}</h4>
                        <p className="card-text">Sampai</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card bg-success text-white h-100">
                      <div className="card-body text-center">
                        <h3 className="card-title">🎉</h3>
                        <h4>{statusCounts.completed}</h4>
                        <p className="card-text">Selesai</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter dan Search */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <select 
                      className="form-select" 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Semua Status ({orders.length})</option>
                      <option value="pending">Menunggu Pembayaran ({statusCounts.pending})</option>
                      <option value="confirmed">Dikonfirmasi ({statusCounts.confirmed})</option>
                      <option value="shipped">Dikirim ({statusCounts.shipped})</option>
                      <option value="delivered">Sampai ({statusCounts.delivered})</option>
                      <option value="completed">Selesai ({statusCounts.completed})</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="🔍 Cari order, nama, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted">
                      Menampilkan {filteredOrders.length} dari {orders.length} pesanan
                      {searchTerm && (
                        <span className="ms-2">
                          <span className="badge bg-info">Hasil pencarian</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="card">
                  <div className="card-body p-0">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Memuat data pesanan...</p>
                      </div>
                    ) : (
                      <div className="table-responsive" style={{minHeight: '400px'}}>
                        <table className="table table-hover mb-0" style={{minWidth: '1200px'}}>
                          <thead className="table-light sticky-top">
                            <tr>
                              <th style={{width: '12%', minWidth: '120px'}}>ID Pesanan</th>
                              <th style={{width: '15%', minWidth: '150px'}}>Reseller</th>
                              <th style={{width: '18%', minWidth: '180px'}}>Email</th>
                              <th style={{width: '12%', minWidth: '120px'}}>Tanggal</th>
                              <th style={{width: '12%', minWidth: '120px'}}>Total</th>
                              <th style={{width: '12%', minWidth: '120px'}}>Status Pesanan</th>
                              <th style={{width: '12%', minWidth: '120px'}}>Status Bayar</th>
                              <th style={{width: '7%', minWidth: '80px'}}>Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrders.length === 0 ? (
                              <tr>
                                <td colSpan="8" className="text-center py-5">
                                  {orders.length === 0 ? (
                                    <>
                                      <div className="mb-3">
                                        <i className="fas fa-inbox fa-3x text-muted"></i>
                                      </div>
                                      <h5>Belum ada pesanan</h5>
                                      <p className="text-muted">Pesanan akan muncul disini setelah reseller membuat order</p>
                                    </>
                                  ) : searchTerm ? (
                                    <>
                                      <div className="mb-3">
                                        <i className="fas fa-search fa-2x text-muted"></i>
                                      </div>
                                      <h6>Tidak ada hasil untuk &quot;{searchTerm}&quot;</h6>
                                      <button 
                                        className="btn btn-sm btn-outline-primary mt-2"
                                        onClick={() => setSearchTerm('')}
                                      >
                                        🔄 Reset Pencarian
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <div className="mb-3">
                                        <i className="fas fa-filter fa-2x text-muted"></i>
                                      </div>
                                      <h6>Tidak ada pesanan dengan status &quot;{getOrderStatusText(statusFilter)}&quot;</h6>
                                      <button 
                                        className="btn btn-sm btn-outline-primary mt-2"
                                        onClick={() => setStatusFilter('all')}
                                      >
                                        🔄 Tampilkan Semua
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ) : (
                              filteredOrders.map((order) => (
                                <tr key={order.id} className={order.paymentStatus === 'waiting_verification' ? 'table-warning' : ''}>
                                  <td className="fw-bold text-nowrap">#{order.orderNumber}</td>
                                  <td style={{wordBreak: 'break-word'}}>{order.resellerName}</td>
                                  <td style={{wordBreak: 'break-word'}}>
                                    {order.resellerEmail}
                                    {order.resellerPhone && (
                                      <small className="d-block text-muted">
                                        📱 {order.resellerPhone}
                                      </small>
                                    )}
                                  </td>
                                  <td className="text-nowrap" style={{fontSize: '0.875rem'}}>
                                    {formatDate(order.createdAt)}
                                  </td>
                                  <td className="fw-bold text-success text-nowrap">
                                    {formatCurrency(order.totalAmount)}
                                    {order.totalCommission && (
                                      <small className="d-block text-info">
                                        Komisi: {formatCurrency(order.totalCommission)}
                                      </small>
                                    )}
                                  </td>
                                  <td>
                                    <span className={getStatusBadgeClass(order.status)} style={{fontSize: '0.75rem'}}>
                                      {getOrderStatusText(order.status)}
                                    </span>
                                    {order.trackingNumber && (
                                      <small className="d-block text-muted text-truncate" style={{maxWidth: '100px'}}>
                                        📦 {order.trackingNumber}
                                      </small>
                                    )}
                                  </td>
                                  <td>
                                    <span className={getPaymentBadgeClass(order.paymentStatus)} style={{fontSize: '0.75rem'}}>
                                      {getPaymentStatusText(order.paymentStatus)}
                                    </span>
                                    {order.paymentMethod && (
                                      <small className="d-block text-muted">
                                        {order.paymentMethod}
                                      </small>
                                    )}
                                    {order.paymentStatus === 'waiting_verification' && (
                                      <small className="d-block text-danger fw-bold">
                                        🚨 PERLU!
                                      </small>
                                    )}
                                  </td>
                                  <td>
                                    <div className="dropdown">
                                      <button className={`btn btn-sm dropdown-toggle ${
                                        order.paymentStatus === 'waiting_verification' 
                                          ? 'btn-danger' 
                                          : 'btn-outline-primary'
                                        }`}
                                        type="button" 
                                        data-bs-toggle="dropdown"
                                        style={{fontSize: '0.75rem'}}
                                      >
                                        {order.paymentStatus === 'waiting_verification' ? '🚨' : '🔍'}
                                      </button>
                                      <ul className="dropdown-menu">
                                        {getAvailableActions(order).map((action, index) => (
                                          <li key={index}>
                                            <button 
                                              className={`dropdown-item ${
                                                action.urgent ? 'text-danger fw-bold' : 
                                                action.danger ? 'text-danger' : ''
                                              }`}
                                              onClick={() => {
                                                if (action.type === 'delete') {
                                                  setDeleteConfirm(order);
                                                } else {
                                                  showActionModal(order, action.type);
                                                }
                                              }}
                                              disabled={!action.available}
                                            >
                                              {action.text}
                                              {action.urgent && ' ⚡'}
                                            </button>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Modal */}
                {showModal && selectedOrder && (
                  <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">
                            {actionType === 'detail' && '📋 Detail Pesanan'}
                            {actionType === 'payment' && '💳 Verifikasi Pembayaran'}
                            {actionType === 'update' && '📝 Update Status Pesanan'}
                          </h5>
                          <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                          {actionType === 'detail' && (
                            <div>
                              <div className="row mb-3">
                                <div className="col-md-6">
                                  <strong>Order Number:</strong> #{selectedOrder.orderNumber}
                                </div>
                                <div className="col-md-6">
                                  <strong>Tanggal:</strong> {formatDate(selectedOrder.createdAt)}
                                </div>
                              </div>
                              <div className="row mb-3">
                                <div className="col-md-6">
                                  <strong>Reseller:</strong> {selectedOrder.resellerName}
                                </div>
                                <div className="col-md-6">
                                  <strong>Email:</strong> {selectedOrder.resellerEmail}
                                </div>
                              </div>
                              <div className="row mb-3">
                                <div className="col-md-6">
                                  <strong>Phone:</strong> {selectedOrder.resellerPhone || 'N/A'}
                                </div>
                                <div className="col-md-6">
                                  <strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}
                                </div>
                              </div>
                              
                              <div className="row mb-3">
                                <div className="col-md-6">
                                  <strong>Status Pesanan:</strong> 
                                  <span className={`ms-2 ${getStatusBadgeClass(selectedOrder.status)}`}>
                                    {getOrderStatusText(selectedOrder.status)}
                                  </span>
                                </div>
                                <div className="col-md-6">
                                  <strong>Status Pembayaran:</strong> 
                                  <span className={`ms-2 ${getPaymentBadgeClass(selectedOrder.paymentStatus)}`}>
                                    {getPaymentStatusText(selectedOrder.paymentStatus)}
                                  </span>
                                </div>
                              </div>

                              {selectedOrder.paymentProofURL && (
                                <div className="mb-3">
                                  <strong>Bukti Pembayaran:</strong>
                                  <div className="mt-2">
                                    <Image 
                                      src={selectedOrder.paymentProofURL} 
                                      alt="Bukti Pembayaran" 
                                      className="img-thumbnail"
                                      style={{maxWidth: '300px'}}
                                      width={300}
                                      height={200}
                                    />
                                  </div>
                                  {selectedOrder.paymentMethod && (
                                    <small className="text-muted d-block mt-1">
                                      Metode: {selectedOrder.paymentMethod}
                                    </small>
                                  )}
                                </div>
                              )}

                              {selectedOrder.shippingAddress && (
                                <div className="mb-3">
                                  <strong>Alamat Pengiriman:</strong>
                                  <p className="mt-1">
                                    {selectedOrder.shippingAddress.name}<br/>
                                    {selectedOrder.shippingAddress.phone}<br/>
                                    {selectedOrder.shippingAddress.address}<br/>
                                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.postalCode}
                                  </p>
                                </div>
                              )}

                              {selectedOrder.products && (
                                <div className="mb-3">
                                  <strong>Produk:</strong>
                                  <div className="table-responsive mt-2">
                                    <table className="table table-sm">
                                      <thead>
                                        <tr>
                                          <th>Produk</th>
                                          <th>Qty</th>
                                          <th>Harga</th>
                                          <th>Total</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {selectedOrder.products.map((product, index) => (
                                          <tr key={index}>
                                            <td>{product.name}</td>
                                            <td>{product.qty}</td>
                                            <td>{formatCurrency(product.price)}</td>
                                            <td>{formatCurrency(product.price * product.qty)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {selectedOrder.adminMessage && (
                                <div className="mb-3">
                                  <strong>Catatan Admin:</strong>
                                  <p className="mt-1 text-muted">{selectedOrder.adminMessage}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {actionType === 'payment' && (
                            <div>
                              <div className="alert alert-warning">
                                <h6>🚨 Verifikasi Pembayaran untuk #{selectedOrder.orderNumber}</h6>
                                <p className="mb-0">
                                  Total: <strong>{formatCurrency(selectedOrder.totalAmount)}</strong><br/>
                                  Status saat ini: <strong>{getPaymentStatusText(selectedOrder.paymentStatus)}</strong>
                                </p>
                              </div>

                              {selectedOrder.paymentProofURL && (
                                <div className="mb-3 text-center">
                                  <strong>Bukti Pembayaran:</strong>
                                  <div className="mt-2">
                                    <Image 
                                      src={selectedOrder.paymentProofURL} 
                                      alt="Bukti Pembayaran" 
                                      className="img-thumbnail"
                                      style={{maxWidth: '400px', maxHeight: '300px'}}
                                      width={400}
                                      height={300}
                                    />
                                  </div>
                                  {selectedOrder.paymentMethod && (
                                    <small className="text-muted d-block mt-1">
                                      Metode: {selectedOrder.paymentMethod}
                                    </small>
                                    )}
                                    </div>
                                  )}
    
                                  <div className="d-flex gap-2 justify-content-end">
                                    <button 
                                      className="btn btn-success"
                                      onClick={() => handlePaymentUpdate(selectedOrder.id, 'paid', 'confirmed', 'Pembayaran telah diverifikasi dan disetujui')}
                                    >
                                      ✅ Setujui Pembayaran
                                    </button>
                                    <button 
                                      className="btn btn-danger"
                                      onClick={() => handlePaymentUpdate(selectedOrder.id, 'failed', 'cancelled', 'Pembayaran ditolak karena bukti tidak valid')}
                                    >
                                      ❌ Tolak Pembayaran
                                    </button>
                                  </div>
                                </div>
                              )}
    
                              {actionType === 'update' && (
                                <div>
                                  <div className="mb-3">
                                    <h6>Update Status untuk #{selectedOrder.orderNumber}</h6>
                                    <p className="text-muted">
                                      Status saat ini: <span className={getStatusBadgeClass(selectedOrder.status)}>
                                        {getOrderStatusText(selectedOrder.status)}
                                      </span>
                                    </p>
                                  </div>
    
                                  <div className="row">
                                    <div className="col-md-6">
                                      <div className="d-grid gap-2">
                                        {selectedOrder.status === 'pending' && (
                                          <button 
                                            className="btn btn-info"
                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed', 'Pesanan dikonfirmasi dan akan segera diproses')}
                                          >
                                            ✅ Konfirmasi Pesanan
                                          </button>
                                        )}
                                        
                                        {selectedOrder.status === 'confirmed' && (
                                          <button 
                                            className="btn btn-primary"
                                            onClick={() => {
                                              const trackingNumber = prompt('Masukkan nomor resi pengiriman:');
                                              if (trackingNumber) {
                                                handleStatusUpdate(selectedOrder.id, 'shipped', `Pesanan telah dikirim dengan resi: ${trackingNumber}`);
                                              }
                                            }}
                                          >
                                            🚚 Tandai Sebagai Dikirim
                                          </button>
                                        )}
                                        
                                        {selectedOrder.status === 'shipped' && (
                                          <button 
                                            className="btn btn-secondary"
                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered', 'Pesanan telah sampai di tujuan')}
                                          >
                                            📦 Tandai Sebagai Sampai
                                          </button>
                                        )}
                                        
                                        {selectedOrder.status === 'delivered' && (
                                          <button 
                                            className="btn btn-success"
                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'completed', 'Pesanan telah selesai')}
                                          >
                                            🎉 Selesaikan Pesanan
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-md-6">
                                      <div className="d-grid gap-2">
                                        {!['completed', 'cancelled'].includes(selectedOrder.status) && (
                                          <button 
                                            className="btn btn-danger"
                                            onClick={() => {
                                              const reason = prompt('Alasan pembatalan:');
                                              if (reason) {
                                                handleStatusUpdate(selectedOrder.id, 'cancelled', `Pesanan dibatalkan: ${reason}`);
                                              }
                                            }}
                                          >
                                            ❌ Batalkan Pesanan
                                          </button>
                                        )}
                                        
                                        <button 
                                          className="btn btn-outline-secondary"
                                          onClick={() => {
                                            const message = prompt('Tambahkan catatan admin:');
                                            if (message) {
                                              handleStatusUpdate(selectedOrder.id, selectedOrder.status, message);
                                            }
                                          }}
                                        >
                                          📝 Tambah Catatan
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="modal-footer">
                              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Tutup
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
    
                    {/* Delete Confirmation Modal */}
                    {deleteConfirm && (
                      <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog">
                          <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                              <h5 className="modal-title">🗑️ Konfirmasi Hapus</h5>
                              <button type="button" className="btn-close btn-close-white" onClick={() => setDeleteConfirm(null)}></button>
                            </div>
                            <div className="modal-body">
                              <div className="alert alert-danger">
                                <h6>⚠️ Peringatan!</h6>
                                <p className="mb-0">
                                  Anda akan menghapus pesanan <strong>#{deleteConfirm.orderNumber}</strong> dari <strong>{deleteConfirm.resellerName}</strong>.
                                  Tindakan ini tidak dapat dibatalkan!
                                </p>
                              </div>
                              <div className="mb-3">
                                <strong>Detail Pesanan:</strong>
                                <ul className="list-unstyled mt-2">
                                  <li>📅 Tanggal: {formatDate(deleteConfirm.createdAt)}</li>
                                  <li>💰 Total: {formatCurrency(deleteConfirm.totalAmount)}</li>
                                  <li>📊 Status: {getOrderStatusText(deleteConfirm.status)}</li>
                                  <li>💳 Pembayaran: {getPaymentStatusText(deleteConfirm.paymentStatus)}</li>
                                </ul>
                              </div>
                            </div>
                            <div className="modal-footer">
                              <button type="button" className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                                ❌ Batal
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-danger"
                                onClick={() => handleDeleteOrder(deleteConfirm.id)}
                              >
                                🗑️ Ya, Hapus Pesanan
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
