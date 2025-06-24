// app/lib/shipments.js
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Generate shipment tracking number
export const generateTrackingNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `SHIP${new Date().getFullYear()}${timestamp}${random}`;
};

// Create shipment from order
export const createShipmentFromOrder = async (orderData) => {
  try {
    const trackingNumber = generateTrackingNumber();
    
    const shipment = {
      trackingNumber,
      orderId: orderData.orderId,
      orderNumber: orderData.orderNumber,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      shippingAddress: orderData.shippingAddress,
      resellerId: orderData.resellerId,
      resellerName: orderData.resellerName,
      items: orderData.items,
      totalWeight: orderData.totalWeight || 0,
      shippingMethod: orderData.shippingMethod,
      shippingCost: orderData.shippingCost,
      courier: orderData.courier || 'JNE',
      status: 'pending', // pending, processed, shipped, delivered, cancelled
      estimatedDelivery: orderData.estimatedDelivery,
      actualDelivery: null,
      notes: orderData.notes || '',
      adminNotes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'shipments'), shipment);
    console.log('Shipment created with ID:', docRef.id);
    return { success: true, shipmentId: docRef.id, trackingNumber };
  } catch (error) {
    console.error('Error creating shipment:', error);
    return { success: false, error: error.message };
  }
};

// Update shipment status
export const updateShipmentStatus = async (shipmentId, status, notes = '') => {
  try {
    const shipmentRef = doc(db, 'shipments', shipmentId);
    const updateData = {
      status,
      adminNotes: notes,
      updatedAt: serverTimestamp()
    };

    // If status is delivered, set actual delivery date
    if (status === 'delivered') {
      updateData.actualDelivery = serverTimestamp();
    }

    await updateDoc(shipmentRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating shipment status:', error);
    return { success: false, error: error.message };
  }
};

// Get all shipments (for admin)
export const getAllShipments = async (statusFilter = null) => {
  try {
    const shipmentsRef = collection(db, 'shipments');
    let q;
    
    if (statusFilter && statusFilter !== 'all') {
      q = query(
        shipmentsRef, 
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(shipmentsRef, orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    const shipments = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      shipments.push({
        id: doc.id,
        ...data,
        createdDate: data.createdAt ? data.createdAt.toDate().toLocaleDateString('id-ID') : 'N/A'
      });
    });
    
    return { success: true, shipments };
  } catch (error) {
    console.error('Error getting all shipments:', error);
    return { success: false, error: error.message };
  }
};

// Get shipment by tracking number
export const getShipmentByTracking = async (trackingNumber) => {
  try {
    const shipmentsRef = collection(db, 'shipments');
    const q = query(shipmentsRef, where('trackingNumber', '==', trackingNumber));
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return { success: false, error: 'Shipment not found' };
    }
    
    const shipmentDoc = querySnapshot.docs[0];
    return { 
      success: true, 
      shipment: { 
        id: shipmentDoc.id, 
        ...shipmentDoc.data() 
      } 
    };
  } catch (error) {
    console.error('Error getting shipment:', error);
    return { success: false, error: error.message };
  }
};

// Get shipments by reseller
export const getShipmentsByReseller = async (resellerId) => {
  try {
    const shipmentsRef = collection(db, 'shipments');
    const q = query(
      shipmentsRef, 
      where('resellerId', '==', resellerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const shipments = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      shipments.push({
        id: doc.id,
        ...data,
        createdDate: data.createdAt ? data.createdAt.toDate().toLocaleDateString('id-ID') : 'N/A'
      });
    });
    
    return { success: true, shipments };
  } catch (error) {
    console.error('Error getting shipments by reseller:', error);
    return { success: false, error: error.message };
  }
};
// Hitung statistik pengiriman
export const getShipmentStats = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'shipments'));
    const shipments = querySnapshot.docs.map(doc => doc.data());

    const stats = {
      total: shipments.length,
      pending: shipments.filter(s => s.status === 'pending').length,
      processed: shipments.filter(s => s.status === 'processed').length,
      shipped: shipments.filter(s => s.status === 'shipped').length,
      delivered: shipments.filter(s => s.status === 'delivered').length,
      cancelled: shipments.filter(s => s.status === 'cancelled').length,
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Error getting shipment stats:', error);
    return { success: false, error: error.message };
  }
};

// Hapus pengiriman (admin only)
export const deleteShipment = async (shipmentId) => {
  try {
    const shipmentRef = doc(db, 'shipments', shipmentId);
    await deleteDoc(shipmentRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return { success: false, error: error.message };
  }
};
