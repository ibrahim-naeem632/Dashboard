import React, { useState } from "react";
import Table from "../components/Table";
import "../styles/orders.css";
import "../styles/animations.css";

/* TYPES */
type Order = {
  id: string;
  customer: string;
  amount: number;
  status: "Pending" | "Completed" | "Shipped" | "Cancelled";
  date: string;
};

const Orders: React.FC = () => {

  /* STATE */
  const [orders, setOrders] = useState<Order[]>([
    { id: "#1001", customer: "Ali Khan", amount: 120, status: "Pending", date: "2025-01-15" },
    { id: "#1002", customer: "Ahmed Raza", amount: 250, status: "Completed", date: "2025-01-14" },
    { id: "#1003", customer: "Sara Malik", amount: 90, status: "Shipped", date: "2025-01-13" },
    { id: "#1004", customer: "Fatima Noor", amount: 340, status: "Completed", date: "2025-01-12" },
    { id: "#1005", customer: "Omar Farooq", amount: 175, status: "Pending", date: "2025-01-11" },
    { id: "#1006", customer: "Zainab Ali", amount: 420, status: "Shipped", date: "2025-01-10" },
    { id: "#1007", customer: "Hassan Shah", amount: 65, status: "Cancelled", date: "2025-01-09" },
    { id: "#1008", customer: "Ayesha Tariq", amount: 290, status: "Completed", date: "2025-01-08" },
    { id: "#1009", customer: "Bilal Ahmed", amount: 130, status: "Pending", date: "2025-01-07" },
    { id: "#1010", customer: "Maryam Iqbal", amount: 510, status: "Shipped", date: "2025-01-06" },
    { id: "#1011", customer: "Usman Ghani", amount: 85, status: "Pending", date: "2025-01-05" },
    { id: "#1012", customer: "Hira Batool", amount: 360, status: "Completed", date: "2025-01-04" },
  ]);

  const [filter, setFilter] = useState("All");

  // ─── MODAL STATES ───
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null);
  const [formData, setFormData] = useState({
    customer: "",
    amount: "",
    status: "Pending",
  });

  /* FILTER */
  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((o) => o.status === filter);

  /* TABLE COLUMNS */
  const columns = [
    { header: "Order ID", accessor: "id" },
    { header: "Customer", accessor: "customer" },
    { header: "Amount", accessor: "amount" },
    { header: "Status", accessor: "status" },
    { header: "Date", accessor: "date" },
  ];

  // ─── HANDLERS ───
  const handleAdd = () => {
    setFormData({ customer: "", amount: "", status: "Pending" });
    setShowAddModal(true);
  };

  const handleAddSubmit = () => {
    if (!formData.customer || !formData.amount) return;
    const newOrder: Order = {
      id: `#${Math.floor(1000 + Math.random() * 9000)}`,
      customer: formData.customer,
      amount: Number(formData.amount),
      status: formData.status as Order["status"],
      date: new Date().toISOString().split("T")[0],
    };
    setOrders([newOrder, ...orders]);
    setShowAddModal(false);
  };

  const handleEdit = (row: Record<string, any>) => {
    setFormData({
      customer: row.customer,
      amount: row.amount.toString(),
      status: row.status,
    });
    setEditingRow(row);
  };

  const handleEditSubmit = () => {
    if (!editingRow) return;
    setOrders(
      orders.map((o) =>
        o.id === editingRow.id
          ? {
              ...o,
              customer: formData.customer,
              amount: Number(formData.amount),
              status: formData.status as Order["status"],
            }
          : o
      )
    );
    setEditingRow(null);
  };

  const handleDelete = (id: string) => {
    // TODO: call DELETE /api/orders/:id
    setOrders(orders.filter((o) => o.id !== id));
  };

  return (
    <div className="orders fade-up">

      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Orders</h2>
          <p>Manage customer orders easily</p>
        </div>

        {/* FILTERS */}
        <div className="orders-filters">
          {["All", "Pending", "Completed", "Shipped", "Cancelled"].map((f) => (
            <button
              key={f}
              className={`orders-filter-btn ${filter === f ? "orders-filter-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f !== "All" && (
                <span className="orders-filter-count">
                  {orders.filter((o) => o.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ TABLE WITH ALL CALLBACKS */}
      <div className="fade-in">
        <Table
          columns={columns}
          data={filteredOrders}
          rowsPerPage={50}
          showActions={true}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          addButtonLabel="Add Order"
          emptyMessage="No orders found"
        />
      </div>

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div className="orders-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="orders-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Order</h3>

            <div className="orders-modal-field">
              <label>Customer Name</label>
              <input
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                placeholder="Enter customer name"
              />
            </div>

            <div className="orders-modal-field">
              <label>Amount ($)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>

            <div className="orders-modal-field">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option>Pending</option>
                <option>Completed</option>
                <option>Shipped</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div className="orders-modal-actions">
              <button className="orders-modal-btn orders-modal-cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="orders-modal-btn orders-modal-confirm" onClick={handleAddSubmit}>
                Add Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editingRow && (
        <div className="orders-modal-overlay" onClick={() => setEditingRow(null)}>
          <div className="orders-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Order {editingRow.id}</h3>

            <div className="orders-modal-field">
              <label>Customer Name</label>
              <input
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              />
            </div>

            <div className="orders-modal-field">
              <label>Amount ($)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="orders-modal-field">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option>Pending</option>
                <option>Completed</option>
                <option>Shipped</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div className="orders-modal-actions">
              <button className="orders-modal-btn orders-modal-cancel" onClick={() => setEditingRow(null)}>
                Cancel
              </button>
              <button className="orders-modal-btn orders-modal-confirm" onClick={handleEditSubmit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;