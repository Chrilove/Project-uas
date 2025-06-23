// lib/shipments.js - Library functions for shipment management
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  getDoc 
} from 'firebase/firestore';
import { db } from './firebase';

// Fungsi untuk membuat pengiriman dari pesanan
export const createShipmentFromOrder = async (order, shippingData) => {
  try {
    console.log('Creating shipment from order:', order.id);
    
    // Generate shipment number
    const timestamp = Date.now();
    const shipmentNumber = `SHP-${timestamp.toString().slice(-8)}`;
    
    // Hitung total berat berdasarkan produk
    let totalWeight = 0;
    if (order.products && Array.isArray(order.products)) {
      totalWeight = order.products.reduce((total, product) => {
        const weight = parseFloat(product.weight || 0.5); // Default 0.5kg jika tidak ada berat
        return total + (weight * (product.qty || 1));
      }, 0);
    }
    
    const shipmentData = {
      // Data pengiriman
      shipmentNumber,
      orderNumber: order.orderNumber || order.id.slice(-6).toUpperCase(),
      orderId: order.id,
      
      // Data reseller
      resellerName: order.resellerName || '',
      resellerEmail: order.resellerEmail || '',
      resellerPhone: order.resellerPhone || '',
      resellerId: order.resellerId || '',
      
      // Data pengiriman
      courier: shippingData.courier || 'JNE',
      service: shippingData.service || 'REG',
      weight: `${totalWeight} kg`,
      cost: shippingData.cost || 0,
      estimatedDays: shippingData.estimatedDays || '2-3 hari',
      
      // Data alamat pengiriman
      shippingAddress: {
        recipientName: order.shippingAddress?.name || order.resellerName || '',
        phone: order.shippingAddress?.phone || order.resellerPhone || '',
        fullAddress: order.shippingAddress ? 
          `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}` :
          'Alamat tidak tersedia',
        city: order.shippingAddress?.city || '',
        province: order.shippingAddress?.province || '',
        postalCode: order.shippingAddress?.postalCode || ''
      },
      
      // Data produk
      products: order.products || [],
      totalAmount: order.totalAmount || 0,
      
      // Status dan timestamp
      status: 'preparing', // preparing, in_transit, delivered, returned, cancelled
      trackingNumber: shippingData.trackingNumber || null,
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Metadata
      createdBy: 'admin',
      notes: shippingData.notes || `Pengiriman untuk pesanan ${order.orderNumber || order.id.slice(-6).toUpperCase()}`
    };
    
    // Simpan ke Firestore
    const docRef = await addDoc(collection(db, 'shipments'), shipmentData);
    
    console.log('Shipment created successfully:', docRef.id);
    
    return {
      success: true,
      shipmentId: docRef.id,
      shipmentNumber,
      data: shipmentData
    };
    
  } catch (error) {
    console.error('Error creating shipment from order:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fungsi untuk mendapatkan semua pengiriman
export const getAllShipments = async () => {
  try {
    const q = query(collection(db, 'shipments'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const shipments = [];
    querySnapshot.forEach((doc) => {
      shipments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      shipments
    };
  } catch (error) {
    console.error('Error getting shipments:', error);
    return {
      success: false,
      error: error.message,
      shipments: []
    };
  }
};

// Fungsi untuk mendapatkan statistik pengiriman
export const getShipmentStats = async () => {
  try {
    const q = query(collection(db, 'shipments'));
    const querySnapshot = await getDocs(q);
    
    let totalShipments = 0;
    let inTransit = 0;
    let delivered = 0;
    let totalCost = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalShipments++;
      
      if (data.status === 'in_transit') inTransit++;
      if (data.status === 'delivered') delivered++;
      
      // Parse cost
      let cost = 0;
      if (typeof data.cost === 'number') {
        cost = data.cost;
      } else if (typeof data.cost === 'string') {
        cost = parseFloat(data.cost.replace(/[^\d]/g, '')) || 0;
      }
      totalCost += cost;
    });
    
    return {
      success: true,
      stats: {
        totalShipments,
        inTransit,
        delivered,
        totalCost
      }
    };
  } catch (error) {
    console.error('Error getting shipment stats:', error);
    return {
      success: false,
      error: error.message,
      stats: {
        totalShipments: 0,
        inTransit: 0,
        delivered: 0,
        totalCost: 0
      }
    };
  }
};

// Fungsi untuk update status pengiriman
export const updateShipmentStatus = async (shipmentId, newStatus) => {
  try {
    const shipmentRef = doc(db, 'shipments', shipmentId);
    await updateDoc(shipmentRef, {
      status: newStatus,
      updatedAt: new Date()
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error updating shipment status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fungsi untuk menghapus pengiriman
export const deleteShipment = async (shipmentId) => {
  try {
    const shipmentRef = doc(db, 'shipments', shipmentId);
    await deleteDoc(shipmentRef);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fungsi untuk mendapatkan pengiriman berdasarkan order ID
export const getShipmentByOrderId = async (orderId) => {
  try {
    const q = query(collection(db, 'shipments'), where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return {
        success: false,
        error: 'Pengiriman tidak ditemukan',
        shipment: null
      };
    }
    
    const doc = querySnapshot.docs[0];
    return {
      success: true,
      shipment: {
        id: doc.id,
        ...doc.data()
      }
    };
  } catch (error) {
    console.error('Error getting shipment by order ID:', error);
    return {
      success: false,
      error: error.message,
      shipment: null
    };
  }
};
