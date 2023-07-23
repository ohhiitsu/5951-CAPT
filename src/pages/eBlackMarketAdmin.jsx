import React, { useState, useEffect } from "react";
import { storage, db, auth } from "../config/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  doc,
  collection,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EBlackMarketAdmin = () => {
  const [file, setFile] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0.0);
  const [openUpload, setUploadOpen] = useState(false);
  const closeUploadModal = () => setUploadOpen(false);
  const openUploadModal = () => setUploadOpen(true);
  const currentUserEmail = auth.currentUser ? auth.currentUser.email : "";
  const adminEmails = ["admin@u.nus.edu"];

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

  const handleChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (file === "") {
      alert("Please add the file");
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (isNaN(price) || !/^\d+(\.\d{1,2})?$/.test(price)) {
      alert("Please enter a valid price");
      return;
    }

    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploaded(false);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const imageStoreRef = doc(db, "eMarketDatabase", file.name);
          setDoc(imageStoreRef, {
            ImageUrl: downloadURL,
            Name: name,
            Quantity: quantity,
            Price: price,
          });
        });
        setUploaded(true);
        loadAllProducts();
      }
    );
  };

  const handleEditPrice = (productId, newPrice) => {
    if (isNaN(newPrice) || !/^\d+(\.\d{1,2})?$/.test(newPrice)) {
      alert("Please enter a valid price");
      return;
    }

    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        return {
          ...product,
          price: Number(parseFloat(newPrice).toFixed(2)),
        };
      }
      return product;
    });

    setProducts(updatedProducts);
    toast.success('Price updated!', { ...toastSettings });
  };

  const handleEditQuantity = async (productId, newQuantity) => {
    if (!Number.isInteger(Number(newQuantity)) || newQuantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    try {
      const productRef = doc(db, "eMarketDatabase", productId);
      await updateDoc(productRef, { Quantity: Number(newQuantity) });
      loadAllProducts();
      toast.success('Quantity updated!', { ...toastSettings });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const productRef = doc(db, "eMarketDatabase", productId);
      await deleteDoc(productRef);
      loadAllProducts();
      toast.success('Product deleted!', { ...toastSettings });
    } catch (error) {
      console.error(error);
    }
  };

  const toastSettings = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
  };

  if (adminEmails.includes(currentUserEmail)) {
    return (
      <div>
        <button onClick={openUploadModal}>Upload a new product</button>
        <Popup open={openUpload} onClose={closeUploadModal}>
          <div>
            <label>
              Product Image:
              <input type="file" accept="image/*" onChange={handleChange} />
            </label>
          </div>
          <div>
            <label>
              Product Name:
              <input
                type="text"
                placeholder="Name"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Product Quantity:
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value, 10);
                  if (newQuantity >= 0) {
                    setQuantity(newQuantity);
                  }
                }}
              />
            </label>
          </div>
          <div>
            <label>
              Product Price ($):
              <input
                type="number"
                placeholder="Price ($)"
                step="0.10"
                value={price}
                onChange={(e) => {
                  const newPrice = parseFloat(e.target.value);
                  if (!isNaN(newPrice) && newPrice >= 0) {
                    const formattedPrice = newPrice.toFixed(2);
                    setPrice(parseFloat(formattedPrice));
                  }
                }}
              />
            </label>
          </div>
          <div>
            <button onClick={handleUpload}>Save</button>
          </div>
          {uploaded && (
            <p className="success-msg">New Product was uploaded successfully</p>
          )}
        </Popup>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Edit Price</th>
              <th>Quantity</th>
              <th>Edit Quantity</th>
              <th>Delete Product</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>
                  <button
                    onClick={() =>
                      handleEditPrice(product.id, prompt("Enter new price:"))
                    }
                  >
                    <EditIcon />
                  </button>{" "}
                </td>
                <td>{product.quantity}</td>
                <td>
                  {" "}
                  <button
                    onClick={() =>
                      handleEditQuantity(
                        product.id,
                        prompt("Enter new quantity:")
                      )
                    }
                  >
                    <EditIcon />
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDeleteProduct(product.id)}>
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div>
            <p>Loading Products...</p>
            <CircularProgress disableShrink />
          </div>
        )}
        <ToastContainer />
      </div>
    );
  } else {
    return <div>You have no authorisation.</div>;
  }
};

export default EBlackMarketAdmin;
