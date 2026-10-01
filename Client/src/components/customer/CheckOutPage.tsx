import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { socket } from '@/socket';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Droplets, 
  Wind, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

// Daftar tahapan status pengerjaan cuci mobil
const WASH_STEPS = [
  { key: 'RECEIVED', label: 'Diterima', icon: Clock, desc: 'Pesanan telah masuk ke sistem' },
  { key: 'QUEUED', label: 'Antrean', icon: Car, desc: 'Menunggu giliran masuk bay cuci' },
  { key: 'WASHING', label: 'Cuci Busa', icon: Droplets, desc: 'Mobil sedang dicuci busa & air bertekanan' },
  { key: 'DRYING', label: 'Pengeringan', icon: Wind, desc: 'Pengeringan bodi, kaca & vakum interior' },
  { key: 'READY', label: 'Siap Diambil', icon: Sparkles, desc: 'Mobil sudah bersih mengkilap & siap diserahkan' },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('UNPAID');
  const [orderStatus, setOrderStatus] = useState<string>('RECEIVED');
  const [loadingOrder, setLoadingOrder] = useState<boolean>(true);
  const [loadingPay, setLoadingPay] = useState<boolean>(false);

  // 1. Ambil Data Order Aktif Customer
  const fetchActiveOrder = async () => {
    try {
      setLoadingOrder(true);
      const res = await api.get('/api/order/my-active');
      const orderData = res.data.data;

      if (orderData) {
        setOrder(orderData);
        setPaymentStatus(orderData.paymentStatus);
        setOrderStatus(orderData.status);

        // Bergabung ke room socket order ini
        socket.connect();
        socket.emit('join_order', orderData.id);
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.error('Gagal mengambil order aktif:', error);
    } finally {
      setLoadingOrder(false);
    }
  };

  useEffect(() => {
    fetchActiveOrder();

    // 2. Listener Realtime: Pembaruan Pembayaran
    socket.on('payment_status_updated', (data: any) => {
      console.log('Update pembayaran realtime:', data);
      if (order && data.orderId === order.id) {
        setPaymentStatus(data.paymentStatus);
      }
    });

    // 3. Listener Realtime: Pembaruan Status Pengerjaan (Wash Progress)
    socket.on('order_status_updated', (data: any) => {
      console.log('Update status pengerjaan realtime:', data);
      if (order && data.orderId === order.id) {
        setOrderStatus(data.status);
      }
    });

    return () => {
      socket.off('payment_status_updated');
      socket.off('order_status_updated');
    };
  }, [order?.id]);

  // Eksekusi Pembayaran Midtrans Snap
  const handlePayNow = async () => {
    if (!order) return;

    try {
      setLoadingPay(true);
      const response = await api.post('/api/payments/create', {
        orderId: order.id,
        amount: order.total,
        customerName: user?.name || order.customer?.name,
        customerEmail: user?.email,
      });

      const { token } = response.data;

      const closeSnapPopup = () => {
  const snapIframe = document.getElementById('snap-midtrans');
  if (snapIframe) snapIframe.remove();
  const snapContainer = document.querySelector('.snap-container');
  if (snapContainer) snapContainer.remove();
};
if ((window as any).snap) {
  (window as any).snap.pay(token, {
    onSuccess: async (result: any) => {
      console.log('Pembayaran selesai via popup:', result);
      
      // 1. Tutup popup snap dari layar
      closeSnapPopup();
      // 2. Ubah status lokal dan fetch ulang pesanan aktif
      setPaymentStatus('SETTLEMENT');
      await fetchActiveOrder();
    },
    onPending: (result: any) => {
      console.log('Menunggu pembayaran:', result);
      closeSnapPopup();
    },
    onError: (err: any) => {
      console.error('Pembayaran gagal:', err);
      closeSnapPopup();
      alert('Pembayaran gagal, silakan coba kembali.');
    },
    onClose: () => {
      console.log('Popup ditutup oleh user');
      closeSnapPopup();
    },
  });
}
    } catch (error: any) {
      console.error('Gagal memproses pembayaran:', error);
      alert(error?.response?.data?.message || 'Gagal memulai transaksi.');
    } finally {
      setLoadingPay(false);
    }
  };

  if (loadingOrder) {
    return (
      <div className="rounded-2xl border border-border p-6 text-center text-sm text-muted-foreground animate-pulse">
        Memeriksa pesanan aktif Anda...
      </div>
    );
  }

  if (!order) {
    return (
      <Card className="border-dashed border-border/80">
        <CardContent className="p-8 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CheckCircle2 className="size-6" />
          </div>
          <h3 className="font-semibold text-base text-foreground">Tidak Ada Tagihan Aktif</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Semua tagihan cuci mobil Anda telah lunas, atau kendaraan Anda belum masuk antrean kasir.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isPaid = paymentStatus === 'SETTLEMENT' || paymentStatus === 'PAID';

  // Indeks status pengerjaan saat ini
  const currentStepIndex = WASH_STEPS.findIndex((s) => s.key === orderStatus);
  const currentStepInfo = WASH_STEPS[currentStepIndex] || {
    label: orderStatus,
    desc: 'Pesanan sedang diproses',
  };

  return (
    <div className="space-y-4">
      {/* KARTU 1: STATUS PENGERJAAN CUCI MOBIL (LIVE TRACKER) */}
      <Card className="border-border/80 shadow-sm overflow-hidden bg-card">
        <CardHeader className="bg-primary/5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Progres Pengerjaan Mobil
            </CardTitle>
            <Badge variant="outline" className="bg-background text-xs font-semibold text-primary border-primary/30">
              {currentStepInfo.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-5">
          {/* Stepper Progress Bar */}
          <div className="relative flex items-center justify-between px-2 sm:px-4">
            {/* Garis background abu-abu */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-muted z-0" />
            
            {/* Garis progres aktif berwarna biru */}
            <div 
              className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500" 
              style={{
                width: `${Math.max(0, (currentStepIndex / (WASH_STEPS.length - 1)) * 88)}%`
              }}
            />

            {/* Titik Lingkaran Setiap Tahap */}
            {WASH_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`flex size-8 sm:size-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                        : isCurrent
                        ? 'bg-background border-primary text-primary ring-4 ring-primary/20 shadow-md'
                        : 'bg-background border-muted-foreground/30 text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="size-4" />
                    ) : (
                      <StepIcon className="size-3.5 sm:size-4" />
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-[10px] sm:text-xs font-medium ${
                      isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Keterangan Status Terkini */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-3">
            <div className="size-2 rounded-full bg-primary animate-ping" />
            <div className="text-xs">
              <span className="font-semibold text-foreground">Status Terkini: </span>
              <span className="text-muted-foreground">{currentStepInfo.desc}</span>
              {order.bay?.name && (
                <span className="ml-1 font-semibold text-primary">({order.bay.name})</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KARTU 2: DETAIL ORDER & PEMBAYARAN */}
      <Card className="border-border/80 shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-semibold text-primary">
                {order.orderCode}
              </span>
              <CardTitle className="text-base font-bold flex items-center gap-1.5 mt-0.5">
                <Car className="size-4 text-primary" />
                {order.vehiclePlate} {order.vehicle?.modelName ? `• ${order.vehicle.modelName}` : ''}
              </CardTitle>
            </div>
            <Badge
              variant={isPaid ? 'default' : 'outline'}
              className={isPaid ? 'bg-emerald-600' : 'border-amber-500 text-amber-600'}
            >
              {isPaid ? 'LUNAS' : 'MENUNGGU PEMBAYARAN'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4 text-sm">
          {/* Layanan */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Layanan yang Dipesan
            </p>
            <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-muted/20 px-3 py-1">
              {order.orderItems?.map((item: any) => (
                <div key={item.id} className="flex justify-between py-2 text-xs">
                  <span>{item.service?.name} (x{item.quantity})</span>
                  <span className="font-medium">Rp {item.subtotal?.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rincian Biaya */}
          <div className="space-y-1.5 border-t border-border/60 pt-3 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>Rp {order.subtotal?.toLocaleString('id-ID')}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Diskon Member</span>
                <span>- Rp {Math.round((order.subtotal * Number(order.discount)) / 100).toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-border/40">
              <span>Total Tagihan</span>
              <span className="text-primary text-base">Rp {order.total?.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Tombol Bayar / Status Lunas */}
          {!isPaid ? (
            <Button
              onClick={handlePayNow}
              disabled={loadingPay}
              className="w-full h-12 text-sm font-semibold rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              <CreditCard className="size-4 mr-2" />
              {loadingPay ? 'Menyiapkan Pembayaran...' : 'Pilih Metode Pembayaran & Bayar'}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-600">
              <CheckCircle2 className="size-5" />
              Pembayaran Telah Lunas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}