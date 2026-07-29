"use client";

import { useState, useEffect } from "react";
import RefundModal from "./RefundModal";

export default function FooterRefundButton() {
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");

  useEffect(() => {
    // Retrieve last order ID from localStorage for non-logged-in customers
    const savedOrderId = localStorage.getItem("proshot_last_order_id");
    if (savedOrderId) {
      setLastOrderId(savedOrderId);
    }
  }, []);

  return (
    <>
      <button
        onClick={() => setShowRefundModal(true)}
        className="text-indigo-600 font-bold hover:underline transition-all"
      >
        🛡️ 규격 미승인 100% 환불 신청
      </button>

      <RefundModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        defaultOrderId={lastOrderId}
      />
    </>
  );
}
