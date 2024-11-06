

import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "../../customer/searchBar/SearchBar"; // Adjust the path if necessary
import styles from "./suppliers.module.css";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [companyID, setCompanyID] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [email, setEmail] = useState("");
  const [suppliedProduct, setSuppliedProduct] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const [editSupplier, setEditSupplier] = useState({
    company_id: "",
    supplier_name: "",
    email: "",
    supplied_product: "",
    price: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const suppliersPerPage = 5; // Show 5 suppliers per page

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = () => {
    axios
      .get("http://localhost:5000/api/suppliers")
      .then((res) => {
        setSuppliers(res.data);
        setFilteredSuppliers(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch suppliers:", err);
        setError("Failed to fetch suppliers");
      });
  };

  const handleAddSupplier = () => {
    if (!companyID || !supplierName || !email || !suppliedProduct || !price) {
      setError("Please fill all fields");
      return;
    }

    const newSupplier = {
      company_id: companyID,
      supplier_name: supplierName,
      email: email,
      supplied_product: suppliedProduct,
      price: parseFloat(price),
    };

    axios
      .post("http://localhost:5000/api/suppliers", newSupplier)
      .then((res) => {
        setSuppliers([res.data, ...suppliers]);
        setFilteredSuppliers([res.data, ...suppliers]);
        setCompanyID("");
        setSupplierName("");
        setEmail("");
        setSuppliedProduct("");
        setPrice("");
        setError("");
        setShowForm(false);
      })
      .catch((err) => {
        console.error("Failed to add supplier:", err);
        setError("Failed to add supplier");
      });
  };

  const handleSearch = (searchTerm) => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = suppliers.filter((supplier) =>
      supplier.supplied_product.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredSuppliers(filtered);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const handleEditClick = (supplier) => {
    setEditingSupplierId(supplier.supplier_id);
    setEditSupplier({
      company_id: supplier.company_id,
      supplier_name: supplier.supplier_name,
      email: supplier.email,
      supplied_product: supplier.supplied_product,
      price: supplier.price,
    });
  };

  const handleSaveClick = (supplierId) => {
    axios
      .put(`http://localhost:5000/api/suppliers/${supplierId}`, editSupplier)
      .then(() => {
        setSuppliers((prevSuppliers) =>
          prevSuppliers.map((supplier) =>
            supplier.supplier_id === supplierId
              ? { ...supplier, ...editSupplier }
              : supplier
          )
        );
        setFilteredSuppliers((prevFiltered) =>
          prevFiltered.map((supplier) =>
            supplier.supplier_id === supplierId
              ? { ...supplier, ...editSupplier }
              : supplier
          )
        );
        setEditingSupplierId(null);
      })
      .catch((err) => {
        console.error("Failed to update supplier:", err);
        setError("Failed to update supplier");
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditSupplier((prev) => ({ ...prev, [name]: value }));
  };

  // Pagination logic
  const indexOfLastSupplier = currentPage * suppliersPerPage;
  const indexOfFirstSupplier = indexOfLastSupplier - suppliersPerPage;
  const currentSuppliers = filteredSuppliers.slice(
    indexOfFirstSupplier,
    indexOfLastSupplier
  );
  const totalPages = Math.ceil(filteredSuppliers.length / suppliersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={styles.suppliersContainer}>
      <h1 className={styles.header}>Suppliers</h1>

      <SearchBar
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        onSearch={handleSearch}
      />

      <button
        className={styles.addSupplierButton}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancel" : "Add New Supplier"}
      </button>

      {showForm && (
        <div className={styles.formContainer}>
          <input
            type="text"
            className={styles.input}
            placeholder="Company ID"
            value={companyID}
            onChange={(e) => setCompanyID(e.target.value)}
          />
          <input
            type="text"
            className={styles.input}
            placeholder="Supplier Name"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
          />
          <input
            type="email"
            className={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            className={styles.input}
            placeholder="Supplied Product"
            value={suppliedProduct}
            onChange={(e) => setSuppliedProduct(e.target.value)}
          />
          <input
            type="text"
            className={styles.input}
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <button
            className={styles.addSupplierButton}
            onClick={handleAddSupplier}
          >
            Submit
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}

      <div className={styles.suppliersTableContainer}>
        <table className={styles.suppliersTable}>
          <thead>
            <tr>
              <th>Supplier ID</th>
              <th>Company ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Supplied Product</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliers.map((supplier, index) => (
              <tr key={index}>
                {editingSupplierId === supplier.supplier_id ? (
                  <>
                    <td>{supplier.supplier_id}</td>
                    <td>
                      <input
                        type="text"
                        name="company_id"
                        value={editSupplier.company_id}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="supplier_name"
                        value={editSupplier.supplier_name}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        name="email"
                        value={editSupplier.email}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="supplied_product"
                        value={editSupplier.supplied_product}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="price"
                        value={editSupplier.price}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <button
                        className={styles.saveButton}
                        onClick={() => handleSaveClick(supplier.supplier_id)}
                      >
                        Save
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{supplier.supplier_id}</td>
                    <td>{supplier.company_id}</td>
                    <td>{supplier.supplier_name}</td>
                    <td>{supplier.email}</td>
                    <td>{supplier.supplied_product}</td>
                    <td>${parseFloat(supplier.price).toFixed(2)}</td>
                    <td>
                      <button
                        className={styles.editButton}
                        onClick={() => handleEditClick(supplier)}
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
      </div>
      <div className={styles.paginationControls}>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? styles.activePage : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Suppliers;
