// app/lib/shipments.js - Complete shipments functionality
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Create new shipment
export const createShipment = async (shipmentData) => {
  try {
    const shipment = {
      orderId: shipmentData.orderId,
      orderNumber: shipmentData.orderNumber,
      trackingNumber: shipmentData.trackingNumber,
      carrier: shipmentData.carrier || 'JNE',
      status: shipmentData.status || 'pending',
      shippingAddress: shipmentData.shippingAddress,
      recipientName: shipmentData.recipientName,
      recipientPhone: shipmentData.recipientPhone,
      shippingCost: shipmentData.shippingCost || 0,
      weight: shipmentData.weight || 0,
      dimensions: shipmentData.dimensions || '',
      estimatedDelivery: shipmentData.estimatedDelivery || null,
      actualDelivery: shipmentData.actualDelivery || null,
      notes: shipmentData.notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'shipments'), shipment);
    console.log('Shipment created with ID:', docRef.id);
    return { success: true, shipmentId: docRef.id };
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
      notes,
      updatedAt: serverTimestamp()
    };

    // If status is delivered, set actual delivery time
    if (status === 'delivered') {
      updateData.actualDelivery = serverTimestamp();
    }

    await updateDoc(shipmentRef, updateData);
    
    // Create shipment log for audit trail
    await createShipmentLog(shipmentId, status, notes);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating shipment status:', error);
    return { success: false, error: error.message };
  }
};

// Create shipment log for audit trail
export const createShipmentLog = async (shipmentId, status, message, actionBy = 'system') => {
  try {
    const logData = {
      shipmentId,
      status,
      message,
      actionBy,
      timestamp: serverTimestamp()
    };

    await addDoc(collection(db, 'shipmentLogs'), logData);
    return { success: true };
  } catch (error) {
    console.error('Error creating shipment log:', error);
    return { success: false, error: error.message };
  }
};

// Get all shipments (for admin)
export const getAllShipments = async () => {
  try {
    const q = query(
      collection(db, 'shipments'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const shipments = [];
    
    querySnapshot.forEach((doc) => {
      shipments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, shipments };
  } catch (error) {
    console.error('Error getting all shipments:', error);
    return { success: false, error: error.message };
  }
};

// Get shipment by order ID
export const getShipmentByOrderId = async (orderId) => {
  try {
    const q = query(
      collection(db, 'shipments'),
      where('orderId', '==', orderId)
    );
    
    const querySnapshot = await getDocs(q);
    let shipment = null;
    
    querySnapshot.forEach((doc) => {
      shipment = {
        id: doc.id,
        ...doc.data()
      };
    });
    
    return { success: true, shipment };
  } catch (error) {
    console.error('Error getting shipment by order ID:', error);
    return { success: false, error: error.message };
  }
};

// Get shipment by tracking number
export const getShipmentByTrackingNumber = async (trackingNumber) => {
  try {
    const q = query(
      collection(db, 'shipments'),
      where('trackingNumber', '==', trackingNumber)
    );
    
    const querySnapshot = await getDocs(q);
    let shipment = null;
    
    querySnapshot.forEach((doc) => {
      shipment = {
        id: doc.id,
        ...doc.data()
      };
    });
    
    if (!shipment) {
      return { success: false, error: 'Shipment not found' };
    }
    
    return { success: true, shipment };
  } catch (error) {
    console.error('Error getting shipment by tracking number:', error);
    return { success: false, error: error.message };
  }
};

// Get shipment statistics - THIS IS THE MISSING FUNCTION!
export const getShipmentStats = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'shipments'));
    const shipments = [];
    
    querySnapshot.forEach((doc) => {
      shipments.push(doc.data());
    });
    
    const stats = {
      totalShipments: shipments.length,
      
      // Status counts
      pending: shipments.filter(s => s.status === 'pending').length,
      processing: shipments.filter(s => s.status === 'processing').length,
      shipped: shipments.filter(s => s.status === 'shipped').length,
      inTransit: shipments.filter(s => s.status === 'in_transit' || s.status === 'shipped').length,
      delivered: shipments.filter(s => s.status === 'delivered').length,
      cancelled: shipments.filter(s => s.status === 'cancelled').length,
      failed: shipments.filter(s => s.status === 'failed').length,
      
      // Financial calculations
      totalCost: shipments.reduce((sum, s) => {
        const cost = typeof s.shippingCost === 'string' ? 
          parseFloat(s.shippingCost.replace(/[^\d]/g, '')) : 
          (s.shippingCost || 0);
        return sum + cost;
      }, 0),
      
      averageShippingCost: shipments.length > 0 ? 
        shipments.reduce((sum, s) => {
          const cost = typeof s.shippingCost === 'string' ? 
            parseFloat(s.shippingCost.replace(/[^\d]/g, '')) : 
            (s.shippingCost || 0);
          return sum + cost;
        }, 0) / shipments.length : 0,
      
      // Carrier breakdown
      carriers: shipments.reduce((acc, s) => {
        const carrier = s.carrier || 'Unknown';
        acc[carrier] = (acc[carrier] || 0) + 1;
        return acc;
      }, {}),
      
      // Delivery performance
      onTimeDeliveries: shipments.filter(s => {
        if (!s.estimatedDelivery || !s.actualDelivery) return false;
        const estimated = s.estimatedDelivery.toDate ? s.estimatedDelivery.toDate() : new Date(s.estimatedDelivery);
        const actual = s.actualDelivery.toDate ? s.actualDelivery.toDate() : new Date(s.actualDelivery);
        return actual <= estimated;
      }).length,
      
      // This month stats
      thisMonthShipments: shipments.filter(s => {
        const shipmentDate = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
        const now = new Date();
        return shipmentDate.getMonth() === now.getMonth() && 
               shipmentDate.getFullYear() === now.getFullYear();
      }).length,
      
      thisMonthCost: shipments
        .filter(s => {
          const shipmentDate = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
          const now = new Date();
          return shipmentDate.getMonth() === now.getMonth() && 
                 shipmentDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, s) => {
          const cost = typeof s.shippingCost === 'string' ? 
            parseFloat(s.shippingCost.replace(/[^\d]/g, '')) : 
            (s.shippingCost || 0);
          return sum + cost;
        }, 0)
    };
    
    return { success: true, stats };
  } catch (error) {
    console.error('Error calculating shipment statistics:', error);
    return { success: false, error: error.message };
  }
};

// Get shipments by status
export const getShipmentsByStatus = async (status) => {
  try {
    const q = query(
      collection(db, 'shipments'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const shipments = [];
    
    querySnapshot.forEach((doc) => {
      shipments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, shipments };
  } catch (error) {
    console.error('Error getting shipments by status:', error);
    return { success: false, error: error.message };
  }
};

// Search shipments by tracking number or order number
export const searchShipments = async (searchTerm) => {
  try {
    const q = query(
      collection(db, 'shipments'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const shipments = [];
    
    querySnapshot.forEach((doc) => {
      const shipmentData = doc.data();
      // Client-side filtering since Firestore doesn't support full-text search
      if (
        shipmentData.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipmentData.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipmentData.recipientName?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        shipments.push({
          id: doc.id,
          ...shipmentData
        });
      }
    });
    
    return { success: true, shipments };
  } catch (error) {
    console.error('Error searching shipments:', error);
    return { success: false, error: error.message };
  }
};

// Update tracking information
export const updateTrackingInfo = async (shipmentId, trackingNumber, carrier, estimatedDelivery = null) => {
  try {
    const shipmentRef = doc(db, 'shipments', shipmentId);
    
    const updateData = {
      trackingNumber,
      carrier,
      status: 'shipped',
      updatedAt: serverTimestamp()
    };
    
    if (estimatedDelivery) {
      updateData.estimatedDelivery = estimatedDelivery;
    }
    
    await updateDoc(shipmentRef, updateData);
    
    // Create shipment log
    await createShipmentLog(
      shipmentId, 
      'shipped', 
      `Tracking updated: ${trackingNumber} via ${carrier}`,
      'admin'
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error updating tracking info:', error);
    return { success: false, error: error.message };
  }
};

// Delete shipment (for admin only)
export const deleteShipment = async (shipmentId) => {
  try {
    const shipmentRef = doc(db, 'shipments', shipmentId);
    
    // Get shipment data first to check if it can be deleted
    const shipmentSnap = await getDoc(shipmentRef);
    if (!shipmentSnap.exists()) {
      return { success: false, error: 'Shipment not found' };
    }
    
    const shipmentData = shipmentSnap.data();
    
    // Only allow deletion of cancelled or pending shipments
    if (!['cancelled', 'pending'].includes(shipmentData.status)) {
      return { success: false, error: 'Only cancelled or pending shipments can be deleted' };
    }
    
    await deleteDoc(shipmentRef);
    
    // Create shipment log for deletion
    await createShipmentLog(
      shipmentId,
      'deleted',
      'Shipment deleted by admin',
      'admin'
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return { success: false, error: error.message };
  }
};