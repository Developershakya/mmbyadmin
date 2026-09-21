/**
 * Client-Side Real Razorpay Checkout Integration (Test Mode)
 * Uses official checkout.js SDK loaded directly into the browser
 */

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay checkout script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({
  checkoutItem,
  onSuccess,
  onDismiss,
  onError
}) {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error('Could not load Razorpay payment gateway. Please check connection.');
    }

    // 1. Create order on the backend with server-computed paise
    const orderRes = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Number(checkoutItem.amount || 0),
        currency: 'INR',
        serviceType: checkoutItem.serviceType,
        packageId: checkoutItem.packageId,
        serviceItemId: checkoutItem.serviceItemId
      })
    });

    const orderData = await orderRes.json();
    if (!orderData.success) {
      throw new Error(orderData.error || 'Failed to create payment order');
    }

    const { orderId, amountInPaise, keyId, currency } = orderData;

    // 2. Launch real Razorpay checkout modal
    const options = {
      key: keyId,
      amount: amountInPaise,
      currency: currency || 'INR',
      name: 'Make My Bharat Yatra',
      description: `${checkoutItem.serviceType}: ${checkoutItem.title || 'Travel Booking'}`,
      order_id: orderId,
      prefill: {
        name: checkoutItem.travelerName || 'Traveler',
        email: checkoutItem.travelerEmail || 'booking@travelpro.com',
        contact: checkoutItem.travelerPhone || '9876543210'
      },
      notes: {
        serviceType: checkoutItem.serviceType,
        packageId: String(checkoutItem.packageId || ''),
        serviceItemId: String(checkoutItem.serviceItemId || '')
      },
      theme: {
        color: '#F97316'
      },
      handler: async function (response) {
        try {
          // 3. Verify signature on backend & execute dummy booking
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: response.razorpay_order_id || orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              serviceType: checkoutItem.serviceType,
              packageId: checkoutItem.packageId,
              serviceItemId: checkoutItem.serviceItemId,
              itineraryDayId: checkoutItem.itineraryDayId,
              bookingPayload: {
                ...checkoutItem.rawPayload,
                totalAmount: Number(checkoutItem.amount || 0)
              }
            })
          });

          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            throw new Error(verifyData.error || 'Payment signature verification failed');
          }

          if (onSuccess) {
            onSuccess(verifyData.booking, verifyData);
          }
        } catch (err) {
          console.error('Payment verification error:', err);
          if (onError) onError(err);
        }
      },
      modal: {
        ondismiss: function () {
          console.log('Razorpay modal closed by user');
          if (onDismiss) onDismiss();
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (resp) {
      console.error('Payment failed in Razorpay:', resp.error);
      if (onError) {
        onError(new Error(resp.error?.description || resp.error?.reason || 'Payment failed'));
      }
    });
    rzp.open();
  } catch (err) {
    console.error('Razorpay initialization error:', err);
    if (onError) onError(err);
  }
}
