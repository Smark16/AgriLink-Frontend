import React from 'react'
import { useLocation } from 'react-router-dom';

function PaymentStatus() {
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const tx_ref = params.get('tx_ref');
    const transaction_id = params.get('transaction_id');

    
  return (
    <div>
      YOUR PAYMENT WAS SUCCESS FULL
    </div>
  )
}

export default PaymentStatus
