import React, { useState } from "react";
import Table from "../components/Table";
import "../styles/products.css";
import "../styles/animations.css";

/* ─── TYPES ─── */
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  status: string;
};

/* ─── COMPONENT ─── */
const Products: React.FC = () => {

  /* STATE */
  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "iPhone 15 Pro", price: 1199, stock: 24, category: "Mobile", status: "Active" },
    { id: "2", name: "MacBook Pro M3", price: 1999, stock: 12, category: "Laptop", status: "Active" },
    { id: "3", name: "AirPods Pro 2", price: 249, stock: 58, category: "Audio", status: "Active" },
    { id: "4", name: "iPad Air", price: 599, stock: 31, category: "Tablet", status: "Active" },
    { id: "5", name: "Apple Watch S9", price: 399, stock: 0, category: "Wearable", status: "Inactive" },
    { id: "6", name: "Samsung S24 Ultra", price: 1299, stock: 18, category: "Mobile", status: "Active" },
    { id: "7", name: "Dell XPS 15", price: 1749, stock: 7, category: "Laptop", status: "Active" },
    { id: "8", name: "Sony WH-1000XM5", price: 349, stock: 42, category: "Audio", status: "Active" },
    { id: "9", name: "Google Pixel 8", price: 699, stock: 0, category: "Mobile", status: "Inactive" },
    { id: "10", name: "Nintendo Switch", price: 299, stock: 15, category: "Gaming", status: "Active" },
    { id: "11", name: "PS5 Controller", price: 69, stock: 85, category: "Gaming", status: "Active" },
    { id: "12", name: "Galaxy Tab S9", price: 849, stock: 9, category: "Tablet", status: "Active" },
  ]);

  const [filter, setFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Record<string, any> | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
  });

  /* ─── CATEGORIES (auto-generated from data) ─── */
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  /* ─── FILTERED DATA ─── */
  const filteredProducts =
    filter === "All"
      ? products
      : products.filter((p) => p.category === filter);

  /* ─── TABLE COLUMNS ─── */
  const columns = [
    { header: "Product", accessor: "name" },
    { header: "Price", accessor: "price" },
    { header: "Stock", accessor: "stock",
      render: (value: number) => (
        <span className={`products-stock ${value === 0 ? "products-stock-out" : value < 10 ? "products-stock-low" : ""}`}>
          {value === 0 ? "Out of Stock" : value < 10 ? `Low (${value})` : value}
        </span>
      ),
    },
    { header: "Category", accessor: "category" },
    { header: "Status", accessor: "status" },
  ];

  /* ─── HANDLERS ─── */
  const handleAdd = () => {
    setFormData({ name: "", price: "", stock: "", category: "" });
    setShowAddModal(true);
  };

  const handleAddSubmit = () => {
    if (!formData.name || !formData.price || !formData.stock || !formData.category) return;
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      category: formData.category,
      status: Number(formData.stock) > 0 ? "Active" : "Inactive",
    };
    setProducts([newProduct, ...products]);
    setShowAddModal(false);
  };

  const handleEdit = (row: Record<string, any>) => {
    setFormData({
      name: row.name,
      price: row.price.toString(),
      stock: row.stock.toString(),
      category: row.category,
    });
    setEditingProduct(row);
  };

  const handleEditSubmit = () => {
    if (!editingProduct) return;
    setProducts(
      products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: formData.name,
              price: Number(formData.price),
              stock: Number(formData.stock),
              category: formData.category,
              status: Number(formData.stock) > 0 ? "Active" : "Inactive",
            }
          : p
      )
    );
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    // TODO: call DELETE /api/products/:id
    setProducts(products.filter((p) => p.id !== id));
  };

  /* ─── UI ─── */
  return (
    <div className="products fade-up">

      {/* HEADER */}
      <div className="products-header">
        <div>
          <h2>Products</h2>
          <p>Manage your inventory and catalog</p>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="products-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`products-filter-btn ${filter === cat ? "products-filter-active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
              {cat !== "All" && (
                <span className="products-filter-count">
                  {products.filter((p) => p.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ TABLE WITH ALL CALLBACKS */}
      <Table
        columns={columns}
        data={filteredProducts}
        rowsPerPage={50}
        showActions={true}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Product"
        emptyMessage="No products found"
      />

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div className="products-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="products-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Product</h3>

            <div className="products-modal-field">
              <label>Product Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>

            <div className="products-modal-row">
              <div className="products-modal-field">
                <label>Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="products-modal-field">
                <label>Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="products-modal-field">
              <label>Category</label>
              <input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Mobile, Laptop, Audio"
              />
            </div>

            <div className="products-modal-actions">
              <button className="products-modal-btn products-modal-cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="products-modal-btn products-modal-confirm" onClick={handleAddSubmit}>
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editingProduct && (
        <div className="products-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="products-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Product</h3>

            <div className="products-modal-field">
              <label>Product Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="products-modal-row">
              <div className="products-modal-field">
                <label>Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="products-modal-field">
                <label>Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="products-modal-field">
              <label>Category</label>
              <input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="products-modal-actions">
              <button className="products-modal-btn products-modal-cancel" onClick={() => setEditingProduct(null)}>
                Cancel
              </button>
              <button className="products-modal-btn products-modal-confirm" onClick={handleEditSubmit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;