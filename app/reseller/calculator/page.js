'use client'

import { useAuth } from '../../components/AuthProvider'
import Sidebar from '../../components/sidebar-reseller'
import { useState, useEffect } from 'react'

export default function CalculatorPage() {
  const { user, loading } = useAuth()
  const [calculations, setCalculations] = useState([])
  const [currentCalc, setCurrentCalc] = useState({
    productName: '',
    wholesalePrice: '',
    sellingPrice: '',
    quantity: 1,
    shippingCost: '',
    packagingCost: '',
    otherCosts: ''
  })

  // Mock product data with wholesale prices
  const [products] = useState([
    { id: 1, name: 'Serum Vitamin C Premium', wholesalePrice: 85000 },
    { id: 2, name: 'Moisturizer Night Cream', wholesalePrice: 65000 },
    { id: 3, name: 'Sunscreen SPF 50+', wholesalePrice: 55000 },
    { id: 4, name: 'Face Wash Gentle Clean', wholesalePrice: 40000 },
    { id: 5, name: 'Toner Hydrating Mist', wholesalePrice: 45000 },
    { id: 6, name: 'Eye Cream Anti Aging', wholesalePrice: 95000 },
    { id: 7, name: 'Cleansing Oil Deep Clean', wholesalePrice: 60000 },
    { id: 8, name: 'Sheet Mask Brightening', wholesalePrice: 15000 }
  ])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    if (product) {
      setCurrentCalc(prev => ({
        ...prev,
        productName: product.name,
        wholesalePrice: product.wholesalePrice
      }))
    }
  }

  const calculateProfit = () => {
    const wholesale = parseFloat(currentCalc.wholesalePrice) || 0
    const selling = parseFloat(currentCalc.sellingPrice) || 0
    const qty = parseInt(currentCalc.quantity) || 1
    const shipping = parseFloat(currentCalc.shippingCost) || 0
    const packaging = parseFloat(currentCalc.packagingCost) || 0
    const others = parseFloat(currentCalc.otherCosts) || 0

    const totalCost = (wholesale * qty) + shipping + packaging + others
    const totalRevenue = selling * qty
    const profit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

    return {
      totalCost,
      totalRevenue,
      profit,
      profitMargin,
      profitPerUnit: qty > 0 ? profit / qty : 0
    }
  }

  const saveCalculation = () => {
    if (!currentCalc.productName || !currentCalc.sellingPrice) {
      alert('Mohon isi nama produk dan harga jual')
      return
    }

    const result = calculateProfit()
    const newCalc = {
      id: Date.now(),
      ...currentCalc,
      ...result,
      timestamp: new Date().toLocaleString('id-ID')
    }

    setCalculations(prev => [newCalc, ...prev])
    
    // Reset form
    setCurrentCalc({
      productName: '',
      wholesalePrice: '',
      sellingPrice: '',
      quantity: 1,
      shippingCost: '',
      packagingCost: '',
      otherCosts: ''
    })
  }

  const deleteCalculation = (id) => {
    setCalculations(prev => prev.filter(calc => calc.id !== id))
  }

  const result = calculateProfit()

  return (
    <>
      <Sidebar />
      
      <div className="main-content">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">
              <i className="fas fa-calculator me-2 text-primary"></i>
              Kalkulator Profit
            </h1>
            <div className="btn-toolbar mb-2 mb-md-0">
              <button 
                className="btn btn-success"
                onClick={saveCalculation}
                disabled={!currentCalc.productName || !currentCalc.sellingPrice}
              >
                <i className="fas fa-save me-1"></i>
                Simpan Perhitungan
              </button>
            </div>
          </div>

          <div className="row">
            {/* Calculator Form */}
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="fas fa-edit me-2"></i>
                    Hitung Keuntungan
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Pilih Produk</label>
                        <select 
                          className="form-select"
                          onChange={(e) => handleProductSelect(e.target.value)}
                          value=""
                        >
                          <option value="">Pilih dari katalog...</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} - Rp {product.wholesalePrice.toLocaleString('id-ID')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Nama Produk</label>
                        <input
                          type="text"
                          className="form-control"
                          value={currentCalc.productName}
                          onChange={(e) => setCurrentCalc(prev => ({...prev, productName: e.target.value}))}
                          placeholder="Masukkan nama produk"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Harga Grosir (per unit)</label>
                        <div className="input-group">
                          <span className="input-group-text">Rp</span>
                          <input
                            type="number"
                            className="form-control"
                            value={currentCalc.wholesalePrice}
                            onChange={(e) => setCurrentCalc(prev => ({...prev, wholesalePrice: e.target.value}))}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Harga Jual (per unit)</label>
                        <div className="input-group">
                          <span className="input-group-text">Rp</span>
                          <input
                            type="number"
                            className="form-control"
                            value={currentCalc.sellingPrice}
                            onChange={(e) => setCurrentCalc(prev => ({...prev, sellingPrice: e.target.value}))}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Jumlah</label>
                        <input
                          type="number"
                          className="form-control"
                          value={currentCalc.quantity}
                          onChange={(e) => setCurrentCalc(prev => ({...prev, quantity: e.target.value}))}
                          min="1"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Biaya Pengiriman</label>
                        <div className="input-group">
                          <span className="input-group-text">Rp</span>
                          <input
                            type="number"
                            className="form-control"
                            value={currentCalc.shippingCost}
                            onChange={(e) => setCurrentCalc(prev => ({...prev, shippingCost: e.target.value}))}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Biaya Packaging</label>
                        <div className="input-group">
                          <span className="input-group-text">Rp</span>
                          <input
                            type="number"
                            className="form-control"
                            value={currentCalc.packagingCost}
                            onChange={(e) => setCurrentCalc(prev => ({...prev, packagingCost: e.target.value}))}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Biaya Lainnya</label>
                        <div className="input-group">
                          <span className="input-group-text">Rp</span>
                          <input
                            type="number"
                            className="form-control"
                            value={currentCalc.otherCosts}
                            onChange={(e) => setCurrentCalc(prev => ({...prev, otherCosts: e.target.value}))}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Result Panel */}
            <div className="col-lg-4">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-chart-line me-2"></i>
                    Hasil Perhitungan
                  </h5>
                </div>
                <div className="card-body">
                  <div className="result-item">
                    <label>Total Modal:</label>
                    <div className="value">Rp {result.totalCost.toLocaleString('id-ID')}</div>
                  </div>
                  
                  <div className="result-item">
                    <label>Total Pendapatan:</label>
                    <div className="value">Rp {result.totalRevenue.toLocaleString('id-ID')}</div>
                  </div>
                  
                  <div className="result-item">
                    <label>Keuntungan Bersih:</label>
                    <div className={`value ${result.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                      Rp {result.profit.toLocaleString('id-ID')}
                    </div>
                  </div>
                  
                  <div className="result-item">
                    <label>Margin Keuntungan:</label>
                    <div className={`value ${result.profitMargin >= 0 ? 'text-success' : 'text-danger'}`}>
                      {result.profitMargin.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="result-item">
                    <label>Profit per Unit:</label>
                    <div className={`value ${result.profitPerUnit >= 0 ? 'text-success' : 'text-danger'}`}>
                      Rp {result.profitPerUnit.toLocaleString('id-ID')}
                    </div>
                  </div>

                  {result.profitMargin > 0 && (
                    <div className="alert alert-success mt-3">
                      <i className="fas fa-thumbs-up me-2"></i>
                      <strong>Bagus!</strong> Margin keuntungan {result.profitMargin.toFixed(1)}%
                    </div>
                  )}

                  {result.profitMargin < 10 && result.profitMargin > 0 && (
                    <div className="alert alert-warning mt-3">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <strong>Perhatian!</strong> Margin keuntungan rendah
                    </div>
                  )}

                  {result.profit < 0 && (
                    <div className="alert alert-danger mt-3">
                      <i className="fas fa-times-circle me-2"></i>
                      <strong>Rugi!</strong> Sesuaikan harga jual
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="card mt-3">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-lightbulb me-2"></i>
                    Tips Pricing
                  </h6>
                </div>
                <div className="card-body">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <small>Margin ideal: 20-40%</small>
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <small>Hitung semua biaya tambahan</small>
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <small>Bandingkan harga kompetitor</small>
                    </li>
                    <li>
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <small>Pertimbangkan tingkat kesulitan jual</small>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Calculations */}
          {calculations.length > 0 && (
            <div className="card mt-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-history me-2"></i>
                  Riwayat Perhitungan ({calculations.length})
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Produk</th>
                        <th>Qty</th>
                        <th>Modal</th>
                        <th>Jual</th>
                        <th>Profit</th>
                        <th>Margin</th>
                        <th>Waktu</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculations.map(calc => (
                        <tr key={calc.id}>
                          <td>
                            <strong>{calc.productName}</strong>
                          </td>
                          <td>{calc.quantity}</td>
                          <td>Rp {calc.totalCost.toLocaleString('id-ID')}</td>
                          <td>Rp {calc.totalRevenue.toLocaleString('id-ID')}</td>
                          <td className={calc.profit >= 0 ? 'text-success' : 'text-danger'}>
                            <strong>Rp {calc.profit.toLocaleString('id-ID')}</strong>
                          </td>
                          <td>
                            <span className={`badge ${calc.profitMargin >= 20 ? 'bg-success' : calc.profitMargin >= 10 ? 'bg-warning' : 'bg-danger'}`}>
                              {calc.profitMargin.toFixed(1)}%
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">{calc.timestamp}</small>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteCalculation(calc.id)}
                              title="Hapus"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .main-content {
          margin-left: 250px;
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        @media (max-width: 767.98px) {
          .main-content {
            margin-left: 0;
            padding-top: 70px;
          }
        }

        @media (max-width: 1024px) and (min-width: 768px) {
          .main-content {
            margin-left: 200px;
          }
        }

        .card {
          border: none;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .card-header {
          background-color: #fff;
          border-bottom: 1px solid #dee2e6;
          font-weight: 600;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f1f3f4;
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-item label {
          font-size: 0.9rem;
          color: #6c757d;
          margin: 0;
        }

        .result-item .value {
          font-weight: bold;
          font-size: 1.1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          border: none;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #ff8a8e 0%, #febfdf 100%);
          transform: translateY(-1px);
        }

        .text-primary {
          color: #ff9a9e !important;
        }

        .border-bottom {
          border-bottom: 2px solid #ff9a9e !important;
        }

        .bg-primary {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%) !important;
        }

        .input-group-text {
          background-color: #f8f9fa;
          border-right: none;
        }

        .input-group .form-control {
          border-left: none;
        }

        .input-group .form-control:focus {
          border-color: #ff9a9e;
          box-shadow: 0 0 0 0.25rem rgba(255, 154, 158, 0.25);
        }

        .form-control:focus, .form-select:focus {
          border-color: #ff9a9e;
          box-shadow: 0 0 0 0.25rem rgba(255, 154, 158, 0.25);
        }

        .table th {
          border-top: none;
          font-weight: 600;
          font-size: 0.875rem;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .alert {
          border-radius: 0.5rem;
          font-size: 0.9rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card {
          animation: fadeIn 0.3s ease-out;
        }

        .btn-success {
          background-color: #28a745;
          border-color: #28a745;
        }

        .btn-success:hover {
          background-color: #218838;
          transform: translateY(-1px);
        }
      `}</style>
    </>
  )
}