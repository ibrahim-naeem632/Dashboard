import React, { useState } from "react";
import Table from "../components/Table";
import "../styles/customers.css";
import "../styles/animations.css";

/* ─── TYPES ─── */
type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  status: string;
  joined: string;
};

/* ─── COMPONENT ─── */
const Customers: React.FC = () => {

  /* STATE */
  const [customers, setCustomers] = useState<Customer[]>([
    { id: "1", name: "Ali Khan", email: "ali@gmail.com", phone: "+92 300 1234567", orders: 12, spent: 2450, status: "Active", joined: "2024-06-15" },
    { id: "2", name: "Ahmed Raza", email: "ahmed@gmail.com", phone: "+92 301 2345678", orders: 5, spent: 890, status: "Active", joined: "2024-07-20" },
    { id: "3", name: "Sara Malik", email: "sara@gmail.com", phone: "+92 302 3456789", orders: 23, spent: 5670, status: "Active", joined: "2024-03-10" },
    { id: "4", name: "Fatima Noor", email: "fatima@gmail.com", phone: "+92 303 4567890", orders: 8, spent: 1240, status: "Active", joined: "2024-08-01" },
    { id: "5", name: "Omar Farooq", email: "omar@gmail.com", phone: "+92 304 5678901", orders: 0, spent: 0, status: "Inactive", joined: "2024-09-12" },
    { id: "6", name: "Zainab Ali", email: "zainab@gmail.com", phone: "+92 305 6789012", orders: 17, spent: 3890, status: "Active", joined: "2024-04-22" },
    { id: "7", name: "Hassan Shah", email: "hassan@gmail.com", phone: "+92 306 7890123", orders: 3, spent: 420, status: "Active", joined: "2024-10-05" },
    { id: "8", name: "Ayesha Tariq", email: "ayesha@gmail.com", phone: "+92 307 8901234", orders: 31, spent: 8900, status: "Active", joined: "2024-01-18" },
    { id: "9", name: "Bilal Ahmed", email: "bilal@gmail.com", phone: "+92 308 9012345", orders: 0, spent: 0, status: "Inactive", joined: "2024-11-02" },
    { id: "10", name: "Maryam Iqbal", email: "maryam@gmail.com", phone: "+92 309 0123456", orders: 14, spent: 3200, status: "Active", joined: "2024-05-30" },
    { id: "11", name: "Usman Ghani", email: "usman@gmail.com", phone: "+92 310 1234567", orders: 7, spent: 1580, status: "Active", joined: "2024-07-08" },
    { id: "12", name: "Hira Batool", email: "hira@gmail.com", phone: "+92 311 2345678", orders: 19, spent: 4150, status: "Active", joined: "2024-02-14" },
  ]);

  const [filter, setFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Record<string, any> | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  /* ─── FILTER ─── */
  const filteredCustomers =
    filter === "All"
      ? customers
      : customers.filter((c) => c.status === filter);

  /* ─── TABLE COLUMNS ─── */
  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "Orders", accessor: "orders" },
    {
      header: "Total Spent",
      accessor: "spent",
      render: (value: number) => (
        <span className="customers-spent">${value.toLocaleString()}</span>
      ),
    },
    { header: "Status", accessor: "status" },
    { header: "Joined", accessor: "joined" },
  ];

  /* ─── HANDLERS ─── */
  const handleAdd = () => {
    setFormData({ name: "", email: "", phone: "" });
    setShowAddModal(true);
  };

  const handleAddSubmit = () => {
    if (!formData.name || !formData.email) return;
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      orders: 0,
      spent: 0,
      status: "Active",
      joined: new Date().toISOString().split("T")[0],
    };
    setCustomers([newCustomer, ...customers]);
    setShowAddModal(false);
  };

  const handleEdit = (row: Record<string, any>) => {
    setFormData({
      name: row.name,
      email: row.email,
      phone: row.phone,
    });
    setEditingCustomer(row);
  };

  const handleEditSubmit = () => {
    if (!editingCustomer) return;
    setCustomers(
      customers.map((c) =>
        c.id === editingCustomer.id
          ? { ...c, name: formData.name, email: formData.email, phone: formData.phone }
          : c
      )
    );
    setEditingCustomer(null);
  };

  const handleDelete = (id: string) => {
    // TODO: call DELETE /api/customers/:id
    setCustomers(customers.filter((c) => c.id !== id));
  };

  /* ─── STATS ─── */
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "Active").length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.spent, 0);

  return (
    <div className="customers fade-up">

      {/* HEADER */}
      <div className="customers-header">
        <div>
          <h2>Customers</h2>
          <p>Manage your customer base</p>
        </div>

        <div className="customers-filters">
          {["All", "Active", "Inactive"].map((f) => (
            <button
              key={f}
              className={`customers-filter-btn ${filter === f ? "customers-filter-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f !== "All" && (
                <span className="customers-filter-count">
                  {customers.filter((c) => c.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="customers-stats">
        <div className="customers-stat-card">
          <span className="customers-stat-label">Total Customers</span>
          <span className="customers-stat-value">{totalCustomers}</span>
        </div>
        <div className="customers-stat-card">
          <span className="customers-stat-label">Active Customers</span>
          <span className="customers-stat-value customers-stat-green">{activeCustomers}</span>
        </div>
        <div className="customers-stat-card">
          <span className="customers-stat-label">Total Revenue</span>
          <span className="customers-stat-value">${totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* ✅ TABLE WITH ALL CALLBACKS */}
      <Table
        columns={columns}
        data={filteredCustomers}
        rowsPerPage={50}
        showActions={true}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Customer"
        emptyMessage="No customers found"
      />

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div className="customers-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="customers-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Customer</h3>

            <div className="customers-modal-field">
              <label>Full Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter customer name"
              />
            </div>

            <div className="customers-modal-field">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@example.com"
              />
            </div>

            <div className="customers-modal-field">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 300 1234567"
              />
            </div>

            <div className="customers-modal-actions">
              <button className="customers-modal-btn customers-modal-cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="customers-modal-btn customers-modal-confirm" onClick={handleAddSubmit}>
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editingCustomer && (
        <div className="customers-modal-overlay" onClick={() => setEditingCustomer(null)}>
          <div className="customers-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Customer</h3>

            <div className="customers-modal-field">
              <label>Full Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="customers-modal-field">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="customers-modal-field">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="customers-modal-actions">
              <button className="customers-modal-btn customers-modal-cancel" onClick={() => setEditingCustomer(null)}>
                Cancel
              </button>
              <button className="customers-modal-btn customers-modal-confirm" onClick={handleEditSubmit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;