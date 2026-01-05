import React from "react";
// [수정] ../.. (두칸 위)가 아니라 ../ (한칸 위)가 맞음
import CartList from "../components/Cart/CartList";

const Cart = () => {
  return (
    <div className="main-content">
      <CartList />
    </div>
  );
};

export default Cart;
