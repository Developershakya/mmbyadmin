/**
 * Client-Side Real Razorpay Checkout Integration (Test Mode)
 * Uses official checkout.js SDK loaded directly into the browser
 */

export const TEST_PAYMENT_CREDENTIALS = {
  upi: 'success@razorpay',
  domesticVisaCard: '4111 1111 1111 1111',
  rupayCard: '5085 0000 0000 0003',
  mastercard: '5123 4567 8901 2346',
  expiry: '12/30',
  cvv: '123',
  otp: '123456'
};

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

export async function verifyPaymentOnBackend({
  orderId,
  paymentId,
  signature = 'sig_test_verified',
  checkoutItem
}) {
  const verifyRes = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      paymentId,
      signature,
      serviceType: checkoutItem.serviceType,
      packageId: checkoutItem.packageId,
      serviceItemId: checkoutItem.serviceItemId,
      itineraryDayId: checkoutItem.itineraryDayId,
      bookingPayload: {
        ...checkoutItem.rawPayload,
        totalAmount: Number(checkoutItem.amount || 0)
      },
      travelerDetails: {
        name: checkoutItem.travelerName,
        email: checkoutItem.travelerEmail,
        phone: checkoutItem.travelerPhone
      }
    })
  });

  const verifyData = await verifyRes.json();
  if (!verifyData.success) {
    throw new Error(verifyData.error || 'Payment signature verification failed');
  }
  return verifyData;
}

export async function simulateTestBooking({
  checkoutItem,
  existingOrderId = null
}) {
  let orderId = existingOrderId;
  if (!orderId) {
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
      throw new Error(orderData.error || 'Failed to initialize payment record');
    }
    orderId = orderData.orderId;
  }

  const testPaymentId = `pay_test_${Date.now()}`;
  return await verifyPaymentOnBackend({
    orderId,
    paymentId: testPaymentId,
    signature: 'sig_test_simulation',
    checkoutItem
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
          // 3. Verify signature on backend & execute supplier booking
          const verifyData = await verifyPaymentOnBackend({
            orderId: response.razorpay_order_id || orderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            checkoutItem
          });

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
      const desc = resp.error?.description || resp.error?.reason || 'Payment failed';
      const isIntl =
        resp.error?.reason === 'international_transaction_not_allowed' ||
        (desc && desc.toLowerCase().includes('international'));

      const enhancedErr = new Error(desc);
      enhancedErr.code = resp.error?.code;
      enhancedErr.reason = resp.error?.reason;
      enhancedErr.source = resp.error?.source;
      enhancedErr.step = resp.error?.step;
      enhancedErr.metadata = resp.error?.metadata;
      enhancedErr.isInternational = isIntl;
      enhancedErr.orderId = orderId;
      enhancedErr.checkoutItem = checkoutItem;

      if (onError) {
        onError(enhancedErr);
      }
    });
    rzp.open();
  } catch (err) {
    console.error('Razorpay initialization error:', err);
    if (onError) onError(err);
  }
}

