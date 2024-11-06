import React, { useState, useEffect, useCallback } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import Products from "./components/customer/products/Products";
import Login from "./components/customer/logIn/Login";
import Cart from "./components/customer/cart/Cart";
import Header from "./components/customer/header/Header";
import ForgotPassword from "./components/customer/forgetPassword/ForgotPassword";
import Register from "./components/customer/register/Register";
import Sidebar from "./components/manager/sideBar/Sidebar";
import Topbar from "./components/manager/topBar/Topbar";
import Dashboard from "./components/manager/dashBoard/Dashboard";
import Suppliers from "./components/manager/suppliers/Suppliers";
import OrdersList from "./components/manager/orderList/OrdersList";
import Messages from "./components/manager/messages/Messages";
import Settings from "./components/manager/managerSettings/Settings";
import ProductSave from "./components/manager/products/ProductsSave";
import AddProfile from "./components/manager/profile/AddProfile"; // Import AddProfile component
import Discounts from "./components/manager/Discounts/Discounts";
import Taxes from "./components/manager/Taxes/Taxes";
import Orders from "./components/customer/orders/Orders.jsx";
import "./App.css";
import ProductsOrder from "./components/manager/productsOrder/ProductsOrders.jsx";
import OutOfStockProducts from "./components/manager/outOfStockProducts/OutOfStockProducts.jsx";
import OrdersFromSuppliers from "./components/manager/ordersFromSuppliers/OrdersFromSuppliers.jsx";
import UpdateProfile from "./components/customer/profile/UpdateProfile";

axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true;

const App = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initially null to represent no authentication
  const [customerName, setCustomerName] = useState("");
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [isManager, setIsManager] = useState(false); // New state to track if the user is a manager

  useEffect(() => {
    const savedName = localStorage.getItem("customerName");
    const savedEmail = localStorage.getItem("customerEmail");
    const savedIsManager = localStorage.getItem("isManager") === "true";
    if (savedEmail) {
      setCustomerName(savedName);
      setCustomerEmail(savedEmail);
      setIsManager(savedIsManager);
      setIsAuthenticated(true);
    }
    fetchProducts();
  }, []);

  const handleLogin = useCallback(async (name, email, isManager) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/orders/email/${email}`
      );
      const userId = response.data.id;
      setCustomerId(userId);
      setIsAuthenticated({ name, email, isManager });
      setCustomerName(name); // Setting customer name
      setIsManager(isManager);
      localStorage.setItem("customerName", name);
      localStorage.setItem("customerEmail", email);
      localStorage.setItem("isManager", isManager ? "true" : "false");
      if (isManager) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching user ID during login:", error);
      // Handle error appropriately
    }
  });

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCustomerName("");
    setCustomerEmail("");
    setIsManager(false);
    setCustomerId(null);
    // Remove login state from localStorage
    localStorage.removeItem("customerName");
    localStorage.removeItem("customerEmail");
    localStorage.removeItem("isManager");

    localStorage.removeItem("authToken");
    sessionStorage.removeItem("userSession");
    setShowSidebar(false);
    navigate("/");
  };

  const fetchProducts = (category = "") => {
    const url = category
      ? `http://localhost:5000/api/products?category=${category}`
      : "http://localhost:5000/api/products";
    axios
      .get(url)
      .then((response) => {
        setProducts(response.data);
        setFilteredProducts(response.data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  };

  const addToCart = (product, quantity) => {
    if (!product || quantity <= 0) return;
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity }];
      }
    });
  };

  const updateCartQuantity = (productId, amount) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + amount) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleSearch = (searchTerm) => {
    const filtered = products.filter((product) =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  return (
    <div className="app">
      {isAuthenticated && isAuthenticated.isManager ? (
        <>
          {isManager}
          <Sidebar onLogout={handleLogout} />
          <div className="main-content">
            <Topbar managerName={customerName} />
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/products/productManagement"
                element={
                  <ProductSave setFilteredProducts={setFilteredProducts} />
                }
              />
              <Route path="/products/orders" element={<ProductsOrder />} />
              <Route
                path="/products/OutOfStock"
                element={<OutOfStockProducts />}
              />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route
                path="/ordersfromsuppliers"
                element={<OrdersFromSuppliers />}
              />
              <Route path="/manage-receipt" element={<OrdersList />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings/*" element={<Settings />} />
              <Route path="/settings/add-profile" element={<AddProfile />} />
              <Route path="/settings/discounts" element={<Discounts />} />
              <Route path="/settings/taxes" element={<Taxes />} />
              <Route
                path="/"
                element={
                  <Products
                    products={filteredProducts}
                    addToCart={addToCart}
                    setProducts={setProducts}
                    setFilteredProducts={setFilteredProducts}
                  />
                }
              />
            </Routes>
          </div>
        </>
      ) : (
        <>
          <div className="customer">
            <div className="header">
              <Header
                onSearch={handleSearch}
                cartItemCount={cart.length}
                fetchCategory={fetchProducts}
                customerName={customerName} // Pass the customer's name to the Header
                onLogout={handleLogout}
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
              />
            </div>

            <div className="mainContainer">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Products
                      products={filteredProducts}
                      addToCart={addToCart}
                      setProducts={setProducts}
                      setFilteredProducts={setFilteredProducts}
                    />
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <Cart
                      cart={cart}
                      updateCartQuantity={updateCartQuantity}
                      clearCart={clearCart}
                      isAuthenticated={isAuthenticated} // Pass isAuthenticated to Cart
                      handleLogin={handleLogin} // Pass handleLogin to Cart
                    />
                  }
                />

                <Route
                  path="/login"
                  element={<Login onLogin={handleLogin} />}
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/register" element={<Register />} />

                <Route path="/messages" element={<Messages />} />
                <Route
                  path="/my-orders"
                  element={<Orders customerId={customerId} />}
                />
                <Route
                  path="/update-profile"
                  element={<UpdateProfile customerId={customerId} />}
                />

                {!isAuthenticated && (
                  <Route
                    path="/dashboard"
                    element={<Login onLogin={handleLogin} />}
                  />
                )}
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
