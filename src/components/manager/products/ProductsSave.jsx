

import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./ProductsSave.module.css"; // Import the CSS module
import ToggleBar from "../toggleBar/ToggleBar"; // Import the ToggleBar component
import SearchBar from "../../customer/searchBar/SearchBar";
import { FaRegPenToSquare } from "react-icons/fa6";

function ProductsSave({ setFilteredProducts }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setLocalFilteredProducts] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [file, setFile] = useState(null);
  const [productName, setProductName] = useState("");
  const [supplier, setSupplier] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [memory, setMemory] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [editProductId, setEditProductId] = useState(null);
  const [isActive, setIsActive] = useState("");
  const [isClicked, setIsClicked] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const [filter, setFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/products/managerProducts"
        );
        setProducts(res.data);
        setLocalFilteredProducts(res.data); // Initially show all products
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (filter === "available") {
      filtered = products.filter((product) => product.is_active);
    } else if (filter === "unavailable") {
      filtered = products.filter((product) => !product.is_active);
    }

    if (searchVal) {
      filtered = filtered.filter((product) =>
        product.product_name.toLowerCase().includes(searchVal.toLowerCase())
      );
    }

    setLocalFilteredProducts(filtered);
    setFilteredProducts(filtered);
  }, [filter, products, searchVal, setFilteredProducts]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (
      !file ||
      !productName ||
      !supplier ||
      !description ||
      !price ||
      !memory ||
      !type ||
      !categoryName ||
      !quantity
    ) {
      setError("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("product_name", productName);
    formData.append("supplier", supplier);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("memory", memory);
    formData.append("type", type);
    formData.append("category_name", categoryName);
    formData.append("quantity", quantity);
    formData.append("is_active", 1);

    if (editProductId) {
      axios
        .put(`http://localhost:5000/api/products/${editProductId}`, formData)
        .then((res) => {
          setProducts(
            products.map((product) =>
              product.id === editProductId ? res.data : product
            )
          );
          setFilteredProducts(
            products.map((product) =>
              product.id === editProductId ? res.data : product
            )
          );
          setError("");
          resetForm();
        })
        .catch((err) => {
          console.error("Failed to update product:", err);
          setError("Failed to update product");
        });
    } else {
      axios
        .post("http://localhost:5000/api/products/upload", formData)
        .then((res) => {
          setProducts([res.data, ...products]);
          setFilteredProducts([res.data, ...products]);
          setError("");
          resetForm();
        })
        .catch((err) => {
          console.error("Failed to upload product:", err);
          setError("Failed to upload product");
        });
    }
  };

  const handleEdit = (product) => {
    setEditProductId(product.id);
    setProductName(product.product_name || "");
    setSupplier(product.supplier || "");
    setDescription(product.description || "");
    setPrice(product.price || "");
    setMemory(product.memory || "");
    setType(product.type || "");
    setCategoryName(product.category_name || "");
    setQuantity(product.quantity || "");
    setIsActive(product.is_active || "");
  };

  const handleToggleVisibility = (productId, newStatus) => {
    const product = products.find((product) => product.id === productId);
    if (!product) return;

    const updatedProduct = { ...product, is_active: newStatus };

    axios
      .put(`http://localhost:5000/api/products/${productId}`, updatedProduct)
      .then((res) => {
        setProducts(
          products.map((product) =>
            product.id === productId ? res.data : product
          )
        );
        setFilteredProducts(
          products.map((product) =>
            product.id === productId ? res.data : product
          )
        );
      })
      .catch((err) => {
        console.error("Failed to update product visibility:", err);
      });
  };

  const resetForm = () => {
    setEditProductId(null);
    setProductName("");
    setSupplier("");
    setDescription("");
    setPrice("");
    setMemory("");
    setType("");
    setFile(null);
    setCategoryName("");
    setQuantity("");
  };

  const handleSearch = (value) => {
    setSearchVal(value);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortConfig.key) {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === "price" || sortConfig.key === "quantity") {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }

      if (valA < valB) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    }
    return 0;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.productsSaveContainer}>
            <h1>Product Management</h1>
            <SearchBar
              searchVal={searchVal}
              setSearchVal={setSearchVal}
              onSearch={handleSearch}
            />
            <div className={styles.filterall}>
              <div className={styles.filterproduct}>
                <label htmlFor="filter">Filter Products:</label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            {isClicked && (
              <div className={styles.formGroup}>
                <input type="file" onChange={handleFileChange} />
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Supplier"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Memory"
                  value={memory}
                  onChange={(e) => setMemory(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                />
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                >
                  <option value="">Select Category</option>
                  <option value="cpu">CPU</option>
                  <option value="motherboard">Motherboard</option>
                  <option value="ram">RAM</option>
                  <option value="gpu">GPU</option>
                  <option value="power_supply">Power Supply</option>
                  <option value="laptops">Laptops</option>
                  <option value="computers">Computers</option>
                </select>
                <input
                  type="text"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <select
                  value={isActive}
                  onChange={(e) => setIsActive(e.target.value)}
                >
                  <option value="">Select Availability</option>
                  <option value="1">Active/Show</option>
                  <option value="0">Inactive/Hide</option>
                </select>
                <button onClick={handleUpload}>
                  {editProductId ? "Update Product" : "Add Product"}
                </button>
                {error && <p className={styles.errorMessage}>{error}</p>}
              </div>
            )}

            <button
              onClick={() => setIsClicked((prev) => !prev)}
              className="addproductbtn"
            >
              {isClicked ? "Close" : "Add Product"}
            </button>
            <div className={styles.productsList}>
              <table className={styles.productsTable}>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th onClick={() => handleSort("product_name")}>
                      Product Name
                    </th>
                    <th>Supplier</th>
                    <th>Description</th>
                    <th onClick={() => handleSort("price")}>Price</th>
                    <th onClick={() => handleSort("memory")}>Memory</th>
                    <th onClick={() => handleSort("type")}>Type</th>
                    <th>Category</th>
                    <th onClick={() => handleSort("quantity")}>Quantity</th>
                    <th>Visibility</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((product) => (
                    <tr
                      key={product.id}
                      style={
                        product.quantity <= 5
                          ? { backgroundColor: "#ad0f04b0", color: "white" }
                          : {}
                      }
                    >
                      <td>
                        <img
                          src={`http://localhost:5000${product.image_path}`}
                          alt={product.product_name}
                          className={styles.productImage}
                        />
                      </td>
                      <td>{product.product_name}</td>
                      <td>{product.supplier}</td>
                      <td>{product.description}</td>
                      <td>${product.price}</td>
                      <td>{product.memory}</td>
                      <td>{product.type}</td>
                      <td>{product.category_name}</td>
                      <td>{product.quantity}</td>
                      <td>
                        <ToggleBar
                          isActive={product.is_active}
                          onToggle={(newStatus) =>
                            handleToggleVisibility(product.id, newStatus)
                          }
                        />
                      </td>
                      <td>
                        <button onClick={() => handleEdit(product)}>
                          <FaRegPenToSquare />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.paginationControls}>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={currentPage === index + 1 ? styles.activePage : ""}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsSave;
