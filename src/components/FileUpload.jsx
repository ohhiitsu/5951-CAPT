import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { doc, collection, getDocs, updateDoc } from "firebase/firestore";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CircularProgress from "@mui/material/CircularProgress";
import { Button } from "@mui/material";

const FileUpload = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllProducts();
  }, []);

  const loadAllProducts = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "eMarketDatabase"));
    let currProducts = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      currProducts.push({
        id: doc.id,
        imageUrl: data.ImageUrl,
        name: data.Name,
        price: data.Price,
        quantity: data.Quantity,
      });
    });
    setProducts(currProducts);
    setLoading(false);
  };

  const handleBuyNow = (product) => {
    openBuyNowModal(product);
  };

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [openBuyNow, setBuyNowOpen] = useState(false);
  const closeBuyNowModal = () => {
    setSelectedProduct(null);
    setBuyNowOpen(false);
  };
  const openBuyNowModal = (product) => {
    setSelectedProduct(product);
    setBuyNowOpen(true);
  };

  const handleQuantityChange = (value) => {
    setSelectedProduct((prevProduct) => {
      const product = products.find((p) => p.id === prevProduct.id);
      const newQuantity = prevProduct.quantity + value;
      const updatedQuantity = Math.max(
        1,
        Math.min(newQuantity, product.quantity)
      );
      return {
        ...prevProduct,
        Quantity: product.quantity,
        quantity: updatedQuantity,
      };
    });
  };

  const handlePaid = async () => {
    try {
      const productRef = doc(db, "eMarketDatabase", selectedProduct.id);
      const newQuantity = isNaN(
        selectedProduct.Quantity - selectedProduct.quantity
      )
        ? 0
        : selectedProduct.Quantity - selectedProduct.quantity;
      await updateDoc(productRef, {
        Quantity: newQuantity,
      });
      toast.success("Thank you for your purchase!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      closeBuyNowModal();
    } catch (error) {
      console.error(error);
    }
    loadAllProducts();
  };

  return (
    <div>
      <div className="black-market header" style={{ marginBottom: "19px" }}>
        <img
          src="https://firebasestorage.googleapis.com/v0/b/orbital2023-3e7ce.appspot.com/o/blackmarket.jpg?alt=media&token=e265b5e9-743c-435d-9463-b2951c2bb752"
          alt="Product"
        />
      </div>
      {loading && (
        <div>
          <p>Loading Products...</p>
          <CircularProgress disableShrink />
        </div>
      )}
      {products.length > 0 ? (
        <div className="product-cards-container">
          {products &&
            products.map((product, index) => {
              return (
                <div className="product-card" key={index}>
                  <div className="product-image-container">
                    <img src={product.imageUrl} alt="Product" />
                  </div>
                  <div className="product-details">
                    <p className="product-name">{product.name}</p>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                    <p className="product-quantity">
                      Quantity: {product.quantity}
                    </p>
                  </div>
                  {product.quantity > 0 && (
                    <Button
                      variant="outlined"
                      onClick={() => handleBuyNow(product)}
                    >
                      Buy Now
                    </Button>
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <p>No products available.</p>
      )}
      <Popup open={openBuyNow} onClose={closeBuyNowModal}>
        <div className="product-popup">
          <p>
            Screenshot the PayNow QR code and proceed to payment, do include
            your name as the reference number.
          </p>
          <p>Once done, click the I have paid button</p>
          <img
            className="paynow"
            src="https://firebasestorage.googleapis.com/v0/b/orbital2023-3e7ce.appspot.com/o/fakepaynow.png?alt=media&token=76ce9ed1-428c-4047-8cfb-53561de27e53"
            alt="FakePaynow"
          />
          <div className="product-details">
            <p>{selectedProduct?.name}</p>
            <div className="quantity-selection">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <p>{selectedProduct?.quantity}</p>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
            <p>
              Total: $
              {(selectedProduct?.price * selectedProduct?.quantity).toFixed(2)}
            </p>
          </div>
          <Button variant="contained" onClick={handlePaid}>
            I have paid
          </Button>
        </div>
      </Popup>
      <ToastContainer />
    </div>
  );
};

export default FileUpload;
