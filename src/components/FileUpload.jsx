import React, { useState, useEffect } from "react";
import { storage, db } from "../config/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, collection, setDoc, getDocs, updateDoc } from "firebase/firestore";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const FileUpload = () => {
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

    const formatPrice = (price) => {
        return `$${price.toFixed(2)}`;
    };

    const handleChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = () => {
        if (file == "") {
            alert("Please add the file");
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
                        Price: price
                    });
                });
                setUploaded(true);
            }
        );
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
        setBuyNowOpen(true)
    };

    const handleQuantityChange = (value) => {
        setSelectedProduct((prevProduct) => {
            const product = products.find((p) => p.Id === prevProduct.Id);
            const newQuantity = prevProduct.quantity + value;
            const updatedQuantity = Math.max(1, Math.min(newQuantity, product.quantity));
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
            console.log(productRef);
            await updateDoc(productRef, {
                Quantity: selectedProduct.Quantity - selectedProduct.quantity 
            });
            closeBuyNowModal();
        } catch (error) {
            console.error(error);
        }
        loadAllProducts();
    };

    return (
        <div>
            <div className="black-market header">
            <img src= "https://firebasestorage.googleapis.com/v0/b/orbital2023-3e7ce.appspot.com/o/blackmarket.jpg?alt=media&token=e265b5e9-743c-435d-9463-b2951c2bb752" alt="Product" />
            </div>
            {loading && <p>Loading Products...</p>}
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
                                        <p className="product-quantity">Quantity: {product.quantity}</p>
                                    </div>
                                    <button onClick={() => handleBuyNow(product)}>Buy Now</button>
                                </div>
                            );
                        })}
                </div>
            ) : (
                <p>No products available.</p>
            )}
            <button onClick={openUploadModal}>Upload a new product</button>
            <Popup open={openUpload} onClose={closeUploadModal}>
                <input type="file" accept="image/*" onChange={handleChange} />
                <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
                <input type="number" placeholder="Quantity" onChange={(e) => setQuantity(parseInt(e.target.value, 10))} />
                <input type="number" placeholder="Price ($)" step="0.10" onChange={(e) => setPrice(parseFloat(e.target.value))} />
                <button onClick={handleUpload}>Save</button>
                {uploaded && (
                    <p className="success-msg">New Product was uploaded successfully</p>
                )}
            </Popup>
            <Popup open={openBuyNow} onClose={closeBuyNowModal}>
                <div className="product-popup">
                    <p>Screenshot the PayNow QR code and proceed to payment, do include your name as the reference number.</p>
                    <p>Once done, click the I have paid button</p>
                    <img className="paynow" src="https://firebasestorage.googleapis.com/v0/b/orbital2023-3e7ce.appspot.com/o/fakepaynow.png?alt=media&token=76ce9ed1-428c-4047-8cfb-53561de27e53" alt="FakePaynow" />
                    <div className="product-details">
                        <p>{selectedProduct?.name}</p>
                        <div className="quantity-selection">
                            <button onClick={() => handleQuantityChange(-1)}>-</button>
                            <p>{selectedProduct?.quantity}</p>
                            <button onClick={() => handleQuantityChange(1)}>+</button>
                        </div>
                        <p>Total: ${(selectedProduct?.price * selectedProduct?.quantity).toFixed(2)}</p>
                    </div>
                    <button onClick={handlePaid}>I have paid</button>
                </div>
            </Popup>

        </div>
    );
};

export default FileUpload;
