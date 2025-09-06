import React from "react";
import { X, Mail, Phone } from "lucide-react";

export default function OrderDetailModal({ order, isOpen, onClose, onUpdateStatus, onUpdatePayment }) {
  if (!isOpen || !order) return null;

  const handleStatusChange = (e) => {
    onUpdateStatus(order.id, e.target.value);
  };

  const handlePaymentChange = (e) => {
    onUpdatePayment(order.id, e.target.value);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "20px",
        boxSizing: "border-box"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 32px",
          borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb"
        }}>
          <div>
            <h2 style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#2C1810",
              fontFamily: "Inter, sans-serif",
              margin: 0,
              marginBottom: 4
            }}>
              Order Details - {order.id}
            </h2>
            <p style={{
              fontSize: 14,
              color: "#6b7280",
              fontFamily: "Inter, sans-serif",
              margin: 0
            }}>
              Complete order information and customer details
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: 6,
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#f3f4f6"}
            onMouseLeave={(e) => e.target.style.background = "none"}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: "32px",
          overflowY: "auto",
          maxHeight: "calc(90vh - 120px)"
        }}>
          {/* Customer Information Section */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#2C1810",
              fontFamily: "Inter, sans-serif",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              👤 Customer Information
            </h3>
            <div style={{
              background: "#f9fafb",
              padding: "20px",
              borderRadius: 8,
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12
              }}>
                <Mail size={16} color="#6b7280" />
                <div>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#2C1810",
                    fontFamily: "Inter, sans-serif"
                  }}>
                    {order.customer.name}
                  </div>
                </div>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12
              }}>
                <Phone size={16} color="#6b7280" />
                <div style={{
                  fontSize: 14,
                  color: "#6b7280",
                  fontFamily: "Inter, sans-serif"
                }}>
                  {order.customer.email}
                </div>
              </div>
            </div>
          </div>

          {/* Order Details Section */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#2C1810",
              fontFamily: "Inter, sans-serif",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              📋 Order Details
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              fontFamily: "Inter, sans-serif"
            }}>
              <div>
                <div style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 4
                }}>
                  Product:
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#2C1810",
                  marginBottom: 16
                }}>
                  {order.product}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 4
                }}>
                  Quantity:
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#2C1810",
                  marginBottom: 16
                }}>
                  {order.quantity}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 4
                }}>
                  Total Amount:
                </div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#2C1810",
                  marginBottom: 16
                }}>
                  {order.amount}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 4
                }}>
                  Payment Method:
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#2C1810",
                  marginBottom: 16
                }}>
                  {order.paymentMethod}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 4
                }}>
                  Order Date:
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#2C1810",
                  marginBottom: 16
                }}>
                  {order.date}, {order.time}
                </div>
              </div>
            </div>
          </div>

          {/* Status and Payment Section */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#2C1810",
              fontFamily: "Inter, sans-serif",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              📦 Status and Payment
            </h3>
            <div style={{
              display: "flex",
              gap: 20,
              alignItems: "flex-end"
            }}>
              <div>
                <label style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                  display: "block"
                }}>
                  Order Status
                </label>
                <select
                  value={order.status}
                  onChange={handleStatusChange}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    fontFamily: "Inter, sans-serif",
                    background: "#fff",
                    cursor: "pointer",
                    outline: "none",
                    minWidth: 150
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div>
                <label style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                  display: "block"
                }}>
                  Payment Status
                </label>
                <select
                  value={order.payment}
                  onChange={handlePaymentChange}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    fontFamily: "Inter, sans-serif",
                    background: "#fff",
                    cursor: "pointer",
                    outline: "none",
                    minWidth: 150
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#2C1810",
              fontFamily: "Inter, sans-serif",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              📝 Order Notes
            </h3>
            <p style={{
              fontSize: 14,
              color: "#374151",
              fontFamily: "Inter, sans-serif",
              background: "#f9fafb",
              padding: "20px",
              borderRadius: 8,
              border: "1px solid #e5e7eb"
            }}>
              {order.notes || "No notes for this order."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}