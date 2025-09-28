import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
console.log("Loaded ENV:", process.env.EMAIL_USER, process.env.EMAIL_PASS ? "PASS_SET" : "PASS_MISSING");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allows your React app to call this server
app.use(express.json());

// Create transporter for nodemailer with explicit SMTP settings
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter verification failed:", error);
  } else {
    console.log("Transporter is ready to send emails");
  }
});

// Define formatCurrency function locally
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount);
    if (isNaN(amount)) {
      return '₱0.00';
    }
  }
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

// New email template for order updates
const createOrderUpdateEmail = (orderData) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Update Notification</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #A68B69; color: #ffffff; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; }
        .status-section { background: #f8f5f2; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .status { font-weight: bold; color: #A68B69; }
        .details { margin: 15px 0; }
        .details p { margin: 8px 0; font-size: 14px; }
        .footer { background: #A68B69; color: #ffffff; padding: 15px; text-align: center; font-size: 12px; }
        .footer a { color: #ffffff; text-decoration: none; }
        @media (max-width: 600px) { .container { margin: 10px; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Update from Your Store</h1>
        </div>
        <div class="content">
          <p>Dear ${orderData.customerName || 'Customer'},</p>
          <p>We wanted to let you know that your order status has been updated. Here's the latest information:</p>
          
          <div class="status-section">
            <h2 style="margin: 0 0 10px; font-size: 18px;">Order Details</h2>
            <p><strong>Order ID:</strong> ${orderData.displayId || orderData.id}</p>
            <p><strong>Order Status:</strong> <span class="status">${orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}</span></p>
            <p><strong>Payment Status:</strong> <span class="status">${orderData.payment.charAt(0).toUpperCase() + orderData.payment.slice(1)}</span></p>
            <p><strong>Total Amount:</strong> ${formatCurrency(orderData.totalAmount)}</p>
          </div>
          
          <div class="details">
            <p>If you have any questions, feel free to reply to this email or contact us at [Your Phone Number] or [Your Email].</p>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2025 Your Store Name. All rights reserved.</p>
          <p><a href="https://yourwebsite.com">Visit our website</a> | <a href="mailto:support@yourstore.com">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// New endpoint for order updates
app.post("/api/send-order-update-email", async (req, res) => {
  try {
    const orderData = req.body;

    // Validate required data
    if (!orderData.customerEmail || !orderData.customerName || !orderData.status || !orderData.payment) {
      return res.status(400).json({ error: "Missing required order data (email, name, status, payment)" });
    }

    const mailOptions = {
      from: `"Your Store Name" <${process.env.EMAIL_USER}>`, // Sender name and email
      to: orderData.customerEmail,
      subject: `Order Update: Status Changed for Order #${orderData.displayId || orderData.id}`,
      html: createOrderUpdateEmail(orderData),
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${orderData.customerEmail}`);

    res.status(200).json({
      success: true,
      message: "Order update email sent successfully",
    });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send email",
      details: error.message,
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Email service is running" });
});

app.listen(PORT, () => {
  console.log(`Email service running on port ${PORT}`);
});