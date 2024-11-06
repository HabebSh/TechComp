import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "../searchBar/SearchBar";
import SelectCategory from "../selectCategory/SelectCategory";
import ProductDetailsModal from "../products/ProductDetailsModal";
import styles from "./products.module.css";
import Footer from "../footer/footer";
axios.defaults.withCredentials = true;

function Products({
  products = [],
  addToCart,
  cart = [],
  setProducts,
  setFilteredProducts,
}) {
  const [selectedMemory, setSelectedMemory] = useState([]);
  const [selectedComputerType, setSelectedComputerType] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDiscountIndex, setCurrentDiscountIndex] = useState(0); // For discount ads
  const [showDetails, setShowDetails] = useState(null); // Keep track of selected product for modal
  const productsPerPage = 9;

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/");
        const activeProducts = res.data.filter((product) => product.is_active);
        setProducts(activeProducts);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllProducts();
  }, [setProducts]);

  useEffect(() => {
    const fetchCategory = (category) => {
      const url = category
        ? `http://localhost:5000/api/products?category=${category}`
        : "http://localhost:5000/api/products";
      axios
        .get(url)
        .then((response) => {
          const activeProducts = response.data.filter(
            (product) => product.is_active
          );
          setProducts(activeProducts);
          setFilteredProducts(activeProducts);
        })
        .catch((error) => console.error("Failed to fetch products:", error));
    };

    fetchCategory(selectedCategory);
  }, [selectedCategory, setFilteredProducts, setProducts]);

  const handleMemoryFilterChange = (memory) => {
    setSelectedMemory((prevMemory) =>
      prevMemory.includes(memory)
        ? prevMemory.filter((item) => item !== memory)
        : [...prevMemory, memory]
    );
  };

  const handleComputerTypeFilterChange = (type) => {
    setSelectedComputerType((prevTypes) =>
      prevTypes.includes(type)
        ? prevTypes.filter((item) => item !== type)
        : [...prevTypes, type]
    );
  };

  const getCurrentCartQuantity = (productId) => {
    const cartItem = cart.find((item) => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleQuantityChange = (productId, amount) => {
    const product = products.find((product) => product.id === productId);
    const currentCartQuantity = getCurrentCartQuantity(productId);
    const newQuantity = (quantities[productId] || 0) + amount;
    setError("");
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: newQuantity,
    }));
  };

  const handleAddToCart = (product, quantity) => {
    const currentCartQuantity = getCurrentCartQuantity(product.id);
    if (quantity + currentCartQuantity > product.quantity) {
      setError("You cannot buy more than the available quantity.");
      return;
    }
    addToCart(product, quantity);
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
  };

  const handleSearch = (searchTerm) => {
    axios
      .get(`http://localhost:5000/api/products/search?q=${searchTerm}`)
      .then((response) => {
        const activeProducts = response.data.filter(
          (product) => product.is_active
        );
        setFilteredProducts(activeProducts);
      })
      .catch((err) => {
        console.error("Error fetching search results:", err);
      });
  };

  const getDiscountedPrice = (product) => {
    const today = new Date();
    const originalPrice = parseFloat(product.price);
    let discountedPrice = originalPrice;

    if (
      product.discount_percentage &&
      new Date(product.start_date) <= today &&
      new Date(product.end_date) >= today
    ) {
      discountedPrice =
        originalPrice - originalPrice * (product.discount_percentage / 100);
    }

    return { originalPrice, discountedPrice };
  };

  // Function to check if the product is new (within the last 24 hours)
  const isNewProduct = (created_at) => {
    const productDate = new Date(created_at);
    const now = new Date();
    const timeDifference = now - productDate;
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    return timeDifference < oneDayInMilliseconds;
  };

  const discountedProducts = products.filter(
    (product) =>
      getDiscountedPrice(product).originalPrice !==
      getDiscountedPrice(product).discountedPrice
  );

  // Set the interval to automatically change discounts every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDiscountIndex(
        (prevIndex) => (prevIndex + 1) % discountedProducts.length
      );
    }, 3000); // Change every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [discountedProducts.length]);

  const filteredProducts = products.filter((product) => {
    const memoryMatch =
      selectedMemory.length === 0 || selectedMemory.includes(product.memory);
    const typeMatch =
      selectedComputerType.length === 0 ||
      selectedComputerType.includes(product.type);
    return memoryMatch && typeMatch;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      {discountedProducts.length > 0 &&
        discountedProducts[currentDiscountIndex] && (
          <div className={styles.discountCenterBanner}>
            <div>
              <h2>SUPER BIG DEALS</h2>
              <p>Don't miss the best deals!</p>
              <div className={styles.discount_info}>
                {discountedProducts[currentDiscountIndex].product_name} -{" "}
                {(
                  (getDiscountedPrice(discountedProducts[currentDiscountIndex])
                    .originalPrice -
                    getDiscountedPrice(discountedProducts[currentDiscountIndex])
                      .discountedPrice) /
                  getDiscountedPrice(discountedProducts[currentDiscountIndex])
                    .originalPrice
                ).toFixed(2) * 100}
                % OFF
              </div>
            </div>
            <img
              src={`http://localhost:5000${discountedProducts[currentDiscountIndex].image_path}`}
              alt="Discounted Product"
            />
          </div>
        )}

      <SearchBar
        searchVal={search}
        setSearchVal={setSearch}
        onSearch={handleSearch}
      />
      <SelectCategory
        selectedCategory={selectedCategory}
        handleCategoryChange={handleCategoryChange}
      />

      <div className={styles.productsContainer}>
        <div className={styles.filterSidebar}>
          <h3>Memory</h3>
          {["4GB", "8GB", "16GB", "32GB", "64GB", "128GB", "256GB"].map(
            (memory) => (
              <div key={memory} className={styles.types}>
                <label htmlFor={`memory-${memory}`}>{memory}</label>
                <input
                  type="checkbox"
                  id={`memory-${memory}`}
                  checked={selectedMemory.includes(memory)}
                  onChange={() => handleMemoryFilterChange(memory)}
                />
              </div>
            )
          )}
          <h3>Computer Types</h3>
          {[
            "MSI",
            "LENOVO",
            "ACER",
            "DELL",
            "APPLE",
            "ASUS",
            "HP",
            "Samsung",
          ].map((type) => (
            <div key={type} className={styles.types}>
              <label htmlFor={`type-${type}`}>{type}</label>
              <input
                type="checkbox"
                id={`type-${type}`}
                checked={selectedComputerType.includes(type)}
                onChange={() => handleComputerTypeFilterChange(type)}
              />
            </div>
          ))}
        </div>
        <div className={styles.productsList}>
          {error && <div className={styles.error}>{error}</div>}
          {currentProducts.map((product) => {
            const { originalPrice, discountedPrice } =
              getDiscountedPrice(product);
            const hasDiscount = originalPrice !== discountedPrice;
            const discountPercentage = hasDiscount
              ? ((originalPrice - discountedPrice) / originalPrice) * 100
              : 0;

            return (
              <div className={styles.product} key={product.id}>
                <div className={styles.productImageWrapper}>
                  {/* New Product Badge */}
                  {isNewProduct(product.created_at) && (
                    <div className={styles.newBadge}>NEW</div>
                  )}

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className={styles.discountBadge}>
                      {discountPercentage.toFixed(0)}% OFF
                    </div>
                  )}
                  <img
                    src={`http://localhost:5000${product.image_path}`}
                    alt={product.product_name}
                    className={styles.productImage}
                  />
                </div>
                <h3>{product.product_name}</h3>

                {/* See Details Button */}
                <button
                  className={styles.seeDetailsButton}
                  onClick={() => setShowDetails(product)}
                >
                  See Details
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination with Page Numbers */}
      <div className={styles.paginationControls}>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={currentPage === index + 1 ? styles.activePage : ""}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Product Details Modal */}
      {showDetails && (
        <ProductDetailsModal
          product={showDetails}
          quantities={quantities}
          onQuantityChange={handleQuantityChange}
          onAddToCart={handleAddToCart}
          onClose={() => setShowDetails(null)}
        />
      )}
      <Footer />
    </div>
  );
}

export default Products;
