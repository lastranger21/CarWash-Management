import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { socket } from '@/socket';

export default function CheckoutPage() {
  const [order, setOrder] = useState({id:null});
  const [paymentStatus, setPaymentStatus] = useState('UNPAID');
  const [loading, setLoading] = useState(false);

  // 1. Setup Listener Socket.IO
  useEffect(() => {
    socket.connect();

    // Dengarkan event pembaruan pembayaran dari backend
    socket.on('payment_status_updated', (data) => {
      console.log('Update status pembayaran diterima realtime:', data);
      setPaymentStatus(data.paymentStatus);

      if (data.paymentStatus === 'SETTLEMENT') {
        alert('Pembayaran Berhasil Dikonfirmasi!');
      }
    });

    return () => {
      socket.off('payment_status_updated');
      socket.disconnect();
    };
  }, []);

  // Fungsi Checkout & Panggil Midtrans Snap
  const handlePayNow = async () => {
    try {
      setLoading(true);

      // Request snap token ke backend
      const response = await axios.post('http://localhost:5000/api/payment/create', {
        orderId: `ORDER-${Date.now()}`,
        amount: 50000, // contoh biaya cuci mobil Rp 50.000
        customerName: 'Budi Santoso',
        customerEmail: 'budi@example.com',
      });

      const { token, orderId } = response.data;
      setOrder({ id: orderId });

      // Join ke room socket khusus order ini
      socket.emit('join_order', orderId);

      //  Tampilkan Midtrans Snap Popup
      window.snap.pay(token, {
        onSuccess: function (result:any) {
          console.log('Pembayaran di popup selesai:', result);
          // Biarkan Socket.IO yang menjadi sumber kebenaran (source of truth)
        },
        onPending: function (result:any) {
          console.log('Menunggu pembayaran (misal VA/QRIS dibuat):', result);
        },
        onError: function (result:any) {
          console.error('Pembayaran gagal:', result);
          alert('Pembayaran Gagal!');
        },
        onClose: function () {
          console.log('Customer menutup popup sebelum bayar');
        },
      });
    } catch (error) {
      console.error('Gagal membuat transaksi:', error);
      alert('Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Pemesanan Car Wash</h2>
      <p>Layanan: Cuci Mobil Eksterior + Interior</p>
      <h3>Total: Rp 50.000</h3>

      {/* Indikator Status Real-time */}
      <div style={{ margin: '20px 0' }}>
        <strong>Status Pembayaran: </strong>
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: 4, 
          backgroundColor: paymentStatus === 'SETTLEMENT' ? '#d4edda' : '#fff3cd',
          color: paymentStatus === 'SETTLEMENT' ? '#155724' : '#856404' 
        }}>
          {paymentStatus === 'SETTLEMENT' ? 'LUNAS (PAID)' : 'MENUNGGU PEMBAYARAN'}
        </span>
      </div>

      {paymentStatus !== 'SETTLEMENT' ? (
        <button 
          onClick={handlePayNow} 
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          {loading ? 'Memproses...' : 'Pilih Metode Pembayaran & Bayar'}
        </button>
      ) : (
        <div style={{ textAlign: 'center', color: '#28a745', fontWeight: 'bold' }}>
          ✓ Pesanan Anda siap dikerjakan oleh tim Car Wash!
        </div>
      )}
    </div>
  );
}