import React from "react";
import CartMainSection from "../CartMainSection/CartMainSection";
import CartFavSection from "../CartFavSection/CartFavSection";
import "./CartView.css";

const CartView = (props) => {
  return (
    <div className="cart-view-container">
      <CartMainSection {...props} />
      <CartFavSection
        uniqueFavorites={props.uniqueFavorites}
        onAdd={props.onAdd}
        onToggleFav={props.onToggleFav}
      />
    </div>
  );
};
export default CartView;
