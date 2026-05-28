const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const handlePayment = async () => {
  const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

  if (!res) {
    alert("Razorpay SDK failed to load. Are you online?");
    return;
  }

  // 1. Create order on backend
  const { data: order } = await axios.post('http://localhost:7000/api/payments/order', {
    amount: totalAmount // Your calculated price
  });

  const options = {
    key: "YOUR_RAZORPAY_KEY_ID", // Enter your Key ID here
    amount: order.amount,
    currency: order.currency,
    name: "DriveNow Rentals",
    description: "Vehicle Booking Transaction",
    order_id: order.id,
    handler: async (response) => {
      // 2. Success! Verify on backend
      try {
        const verifyRes = await axios.post('http://localhost:7000/api/payments/verify', response);
        if(verifyRes.status === 200) {
            // 3. Finalize the booking in your DB
            confirmBooking(response.razorpay_payment_id);
        }
      } catch (err) {
        alert("Verification failed");
      }
    },
    prefill: {
      name: userInfo.name,
      email: userInfo.email,
    },
    theme: { color: "#2563eb" },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};