const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({});

/**
 * Sends an order notification email to the admin.
 * @param {Object} order - The full order object just created in DB.
 */
const sendOrderNotification = async (order) => {
  console.log("➡️ sendOrderNotification called for order:", order.orderId);
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Build product table rows
    const productRows = order.products
      .map(
        (p, i) => `
        <tr style="background:${i % 2 === 0 ? "#f9f9f9" : "#ffffff"}">
          <td style="padding:8px 12px;border:1px solid #ddd;">${i + 1}</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">
            <img src="${p.image}" alt="${p.title}" width="50" height="50" style="object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:8px;" />
            ${p.title}
          </td>
          <td style="padding:8px 12px;border:1px solid #ddd;text-align:center;">${p.quantity}</td>
          <td style="padding:8px 12px;border:1px solid #ddd;text-align:right;">Rs.${(p.new_price * p.quantity).toLocaleString()}</td>
        </tr>`
      )
      .join("");

    const shippingAddress = [
      order.fullName,
      order.buildingNo,
      order.colony,
      order.area,
      `${order.city}${order.province ? ", " + order.province : ""}`,
    ]
      .filter(Boolean)
      .join(", ");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>New Order Notification</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:#9B0000;padding:24px 32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;">🛒 New Order Received!</h1>
              <p style="color:#ffcccc;margin:6px 0 0;font-size:13px;">DesiMirch Masala Admin Panel</p>
            </td>
          </tr>
          <!-- Order Info -->
          <tr>
            <td style="padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:50%;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;">Order ID</p>
                    <p style="margin:0 0 16px;font-size:15px;font-weight:bold;color:#333;">${order.orderId}</p>
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;">Payment Method</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#333;">${order.paymentMethod}</p>
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;">Order Date</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#333;">${order.Date || new Date().toLocaleDateString()}</p>
                  </td>
                  <td style="width:50%;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;">Customer Name</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#333;">${order.fullName || "N/A"}</p>
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;">Phone</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#333;">${order.phone || order.mobile || "N/A"}</p>
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;">Shipping Address</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#333;">${shippingAddress}</p>
                  </td>
                </tr>
              </table>
              <!-- Products -->
              <h3 style="font-size:15px;color:#9B0000;border-bottom:2px solid #9B0000;padding-bottom:6px;margin-bottom:12px;">Ordered Products</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr style="background:#9B0000;color:#fff;">
                    <th style="padding:8px 12px;border:1px solid #ddd;text-align:left;">#</th>
                    <th style="padding:8px 12px;border:1px solid #ddd;text-align:left;">Product</th>
                    <th style="padding:8px 12px;border:1px solid #ddd;text-align:center;">Qty</th>
                    <th style="padding:8px 12px;border:1px solid #ddd;text-align:right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${productRows}
                </tbody>
              </table>
              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td align="right">
                    <p style="font-size:18px;font-weight:bold;color:#9B0000;margin:0;">
                      Total: Rs.${Number(order.totalAmount).toLocaleString()}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f4f4f4;padding:16px 32px;text-align:center;font-size:12px;color:#999;">
              This is an automated notification from DesiMirch Masala. Please log in to the admin panel to manage this order.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const mailOptions = {
      from: `"DesiMirch Masala Orders" <${process.env.EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🛒 New Order Received — ${order.orderId}`,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order notification email sent to ${process.env.ADMIN_EMAIL}`);
  } catch (error) {
    // Don't block order creation if email fails
    console.error("❌ Failed to send order notification email (inside function):", error);
  }
};

module.exports = sendOrderNotification;
