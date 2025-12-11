"use server";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL || "",
    pass: process.env.GMAIL_APP_PASSWORD || "",
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: options.from || process.env.EMAIL_FROM || "noreply@mannequincare.in",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  orderData: {
    orderNumber: string;
    customerName: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    shippingAddress: {
      fullName: string;
      streetAddress: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
    };
    estimatedDelivery: string;
  },
): Promise<void> {
  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
          .content { background: #fff; padding: 30px; }
          .order-section { margin: 20px 0; }
          .order-section h3 { color: #000; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 4px 4px; }
          .button { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase</p>
          </div>
          <div class="content">
            <p>Hi ${orderData.customerName},</p>
            <p>Your order has been confirmed and will be shipped soon. Here are your order details:</p>
            
            <div class="order-section">
              <h3>Order Number: ${orderData.orderNumber}</h3>
              <p>Order Date: ${new Date().toLocaleDateString()}</p>
              <p>Estimated Delivery: ${orderData.estimatedDelivery}</p>
            </div>

            <div class="order-section">
              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 8px; text-align: left;">Product</th>
                    <th style="padding: 8px; text-align: center;">Qty</th>
                    <th style="padding: 8px; text-align: right;">Price</th>
                    <th style="padding: 8px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div class="order-section">
              <h3>Order Summary</h3>
              <table style="border: none;">
                <tr>
                  <td style="padding: 8px;">Subtotal:</td>
                  <td style="padding: 8px; text-align: right;">₹${orderData.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px;">Tax:</td>
                  <td style="padding: 8px; text-align: right;">₹${orderData.tax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px;">Shipping:</td>
                  <td style="padding: 8px; text-align: right;">₹${orderData.shipping.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #000; font-weight: bold;">
                  <td style="padding: 8px;">Total:</td>
                  <td style="padding: 8px; text-align: right;">₹${orderData.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <div class="order-section">
              <h3>Shipping Address</h3>
              <p>
                ${orderData.shippingAddress.fullName}<br>
                ${orderData.shippingAddress.streetAddress}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}<br>
                ${orderData.shippingAddress.country}<br>
                Phone: ${orderData.shippingAddress.phone}
              </p>
            </div>

            <p>Track your order and manage returns at your account page.</p>
            <p>Thank you for shopping with Mannequin Care!</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Mannequin Care. All rights reserved.</p>
            <p>If you have any questions, please contact us at support@mannequincare.in</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Order Confirmed - ${orderData.orderNumber}`,
    html,
  });
}

export async function sendAdminOrderNotification(
  orderData: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    shippingAddress: {
      fullName: string;
      streetAddress: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
    };
    paymentMethod: string;
  },
): Promise<void> {
  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; }
          .header { background: #d32f2f; color: #fff; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
          .content { background: #fff; padding: 30px; }
          .section { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 4px 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order Received!</h1>
            <p>Order #${orderData.orderNumber}</p>
          </div>
          <div class="content">
            <p><strong>New order received from your Mannequin Care store.</strong></p>
            
            <div class="section">
              <h3>Customer Information</h3>
              <p>
                <strong>Name:</strong> ${orderData.customerName}<br>
                <strong>Email:</strong> ${orderData.customerEmail}<br>
                <strong>Phone:</strong> ${orderData.customerPhone}<br>
                <strong>Payment Method:</strong> ${orderData.paymentMethod}
              </p>
            </div>

            <div class="section">
              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 8px; text-align: left;">Product</th>
                    <th style="padding: 8px; text-align: center;">Qty</th>
                    <th style="padding: 8px; text-align: right;">Price</th>
                    <th style="padding: 8px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div class="section">
              <h3>Order Total: ₹${orderData.total.toFixed(2)}</h3>
            </div>

            <div class="section">
              <h3>Shipping Address</h3>
              <p>
                ${orderData.shippingAddress.fullName}<br>
                ${orderData.shippingAddress.streetAddress}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}<br>
                ${orderData.shippingAddress.country}<br>
                Phone: ${orderData.shippingAddress.phone}
              </p>
            </div>

            <p style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/orders" style="background: #d32f2f; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Order in Admin Panel</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Mannequin Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: process.env.GMAIL_EMAIL || "admin@mannequincare.in",
    subject: `New Order Received - ${orderData.orderNumber}`,
    html,
  });
}

export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  orderData: {
    orderNumber: string;
    customerName: string;
    status: string;
    paymentStatus: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    shippingAddress: {
      fullName: string;
      streetAddress: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
    };
  },
): Promise<void> {
  const statusMessages = {
    pending: "Your order is being processed.",
    processing: "Your order is now being prepared for shipment.",
    completed: "Your order has been completed and delivered.",
    cancelled: "Your order has been cancelled.",
    refunded: "Your order has been refunded.",
  };

  const statusColors = {
    pending: "#f59e0b",
    processing: "#3b82f6",
    completed: "#10b981",
    cancelled: "#ef4444",
    refunded: "#8b5cf6",
  };

  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; }
          .header { background: ${statusColors[orderData.status as keyof typeof statusColors] || "#000"}; color: #fff; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
          .content { background: #fff; padding: 30px; }
          .status-badge { display: inline-block; background: ${statusColors[orderData.status as keyof typeof statusColors] || "#000"}; color: #fff; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .order-section { margin: 20px 0; }
          .order-section h3 { color: #000; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 4px 4px; }
          .button { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Status Update</h1>
            <p>Order #${orderData.orderNumber}</p>
          </div>
          <div class="content">
            <p>Hi ${orderData.customerName},</p>
            <p>Your order status has been updated:</p>

            <div style="text-align: center; margin: 20px 0;">
              <span class="status-badge">${orderData.status.toUpperCase()}</span>
            </div>

            <p><strong>${statusMessages[orderData.status as keyof typeof statusMessages] || "Your order status has been updated."}</strong></p>

            <div class="order-section">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
              <p><strong>Payment Status:</strong> ${orderData.paymentStatus}</p>
              <p><strong>Order Total:</strong> ₹${orderData.total.toFixed(2)}</p>
            </div>

            <div class="order-section">
              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 8px; text-align: left;">Product</th>
                    <th style="padding: 8px; text-align: center;">Qty</th>
                    <th style="padding: 8px; text-align: right;">Price</th>
                    <th style="padding: 8px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div class="order-section">
              <h3>Shipping Address</h3>
              <p>
                ${orderData.shippingAddress.fullName}<br>
                ${orderData.shippingAddress.streetAddress}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}<br>
                ${orderData.shippingAddress.country}<br>
                Phone: ${orderData.shippingAddress.phone}
              </p>
            </div>

            <p>If you have any questions about your order, please contact our support team.</p>
            <p>Thank you for shopping with Mannequin Care!</p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders" class="button">View Your Orders</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 Mannequin Care. All rights reserved.</p>
            <p>If you have any questions, please contact us at support@mannequincare.in</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Order Status Update - ${orderData.orderNumber}`,
    html,
  });
}
