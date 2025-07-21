// backend/controllers/contactController.js
const nodemailer = require("nodemailer");
const dotenv     = require("dotenv");
dotenv.config();

// 1) configure transporter once
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 2) helper to send contact‐form email
async function sendContactEmail({ name, email, department, subject, message, file }) {
  const recipients = (process.env.CONTACT_EMAIL_RECIPIENTS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  if (!recipients.length) return;

  const mailOptions = {
    from:    `"Website Contact" <${process.env.SMTP_USER}>`,
    to:      recipients.join(","),
    subject: `Contact Form: ${subject}`,
    html: `
      <h2>New Message from ${name}</h2>
      <p><strong>Department:</strong> ${department}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
    `,
    attachments: file
      ? [{
          filename: file.originalname,
          path:     file.path
        }]
      : []
  };

  await transporter.sendMail(mailOptions);
}

// 3) controller action
exports.handleContact = async (req, res) => {
  try {
    const { name, email, department, subject, message } = req.body;
    if (!name || !email || !department || !subject || !message) {
      return res.status(400).json({ error: "All fields except file are required." });
    }

    // multer has put the file metadata on req.file (if provided)
    const file = req.file; 

    // send (fire-and-forget)
    sendContactEmail({ name, email, department, subject, message, file })
      .catch(err => console.error("Contact email failed:", err));

    return res.status(200).json({ message: "Your message has been sent!" });
  } catch (err) {
    console.error("Contact form error:", err);
    return res.status(500).json({ error: "Server error sending message." });
  }
};
