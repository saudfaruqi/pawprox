// backend/controllers/lostFoundController.js
const lostPetModel = require("../models/lostFoundModel");
const nodemailer      = require("nodemailer");
const dotenv          = require("dotenv");
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

// 2) helper to send a lost vs. found email
async function sendAlertEmail(alert) {
  // pick recipients from env (comma‑separated)
  const recipients = (process.env.ALERT_EMAIL_RECIPIENTS || "")
    .split(",")
    .map(e => e.trim())
    .filter(Boolean);
  if (!recipients.length) return;

  // determine phrasing
  const isLost = alert.status.toLowerCase() === "lost";
  const title  = isLost ? "Lost Pet Alert" : "Found Pet Alert";
  const heading= isLost
    ? `<h2 style="color:#D32F2F;">A pet has gone missing!</h2>`
    : `<h2 style="color:#388E3C;">Someone has found a pet!</h2>`;

  // build mail options
  const mailOptions = {
    from:    `"Pet Alerts" <${process.env.SMTP_USER}>`,
    to:      recipients.join(","),
    subject: `${title}: ${alert.petName} (${alert.species})`,
    html: `
      ${heading}
      <ul>
        <li><strong>Name:</strong> ${alert.petName}</li>
        <li><strong>Species:</strong> ${alert.species}</li>
        <li><strong>Description:</strong> ${alert.description}</li>
        <li><strong>Last Seen:</strong> ${new Date(alert.lastSeen).toLocaleString()}</li>
        <li><strong>Location:</strong> ${alert.location}</li>
        <li><strong>Contact:</strong> ${alert.contactInfo}</li>
      </ul>
      ${alert.image ? `<p><img src="cid:pet-image" style="max-width:100%;"/></p>` : ""}
    `,
    attachments: alert.image
      ? [{
          filename: alert.image.split("/").pop(),
          path:     alert.image,
          cid:      "pet-image"
        }]
      : []
  };

  await transporter.sendMail(mailOptions);
}

/**
 * GET /api/lost-found
 */
exports.getLostPets = async (req, res) => {
  try {
    const alerts = await lostPetModel.getLostPets();
    return res.status(200).json(alerts);
  } catch (error) {
    console.error("Error fetching lost/found alerts:", error);
    return res.status(500).json({ error: "Server error while fetching alerts" });
  }
};

/**
 * POST /api/lost-found
 */
exports.createLostPet = async (req, res) => {
  const image = req.file ? req.file.path : null;
  const {
    petName, species, description,
    location, status, contactInfo, lastSeen, user_id
  } = req.body;

  if (!petName || !species || !description ||
      !location || !status || !contactInfo || !lastSeen) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const finalUserId = user_id || (req.user && req.user.id) || null;
    const insertId = await lostPetModel.createLostPet({
      petName, species, description,
      location, status, contactInfo,
      lastSeen, image, user_id: finalUserId
    });

    const newAlert = {
      id: insertId,
      petName, species, description,
      location, status, contactInfo,
      lastSeen, image, user_id: finalUserId
    };

    // fire‑and‑forget email
    sendAlertEmail(newAlert)
      .catch(err => console.error("Failed to send alert email:", err));

    return res.status(201).json(newAlert);
  } catch (error) {
    console.error("Error creating alert:", error);
    return res.status(500).json({ error: "Server error while creating alert" });
  }
};

/**
 * PUT /api/lost-found/:id
 */
exports.updateLostPet = async (req, res) => {
  const id    = req.params.id;
  const image = req.file ? req.file.path : (req.body.existingImage || undefined);
  const {
    petName, species, description,
    location, status, contactInfo, lastSeen
  } = req.body;

  if (!petName || !species || !description ||
      !location || !status || !contactInfo || !lastSeen) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await lostPetModel.updateLostPet(id, {
      petName, species, description,
      location, status, contactInfo,
      lastSeen, image
    });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Alert not found" });
    }
    const updated = await lostPetModel.getLostPetById(id);
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating alert:", error);
    return res.status(500).json({ error: "Server error while updating alert" });
  }
};

/**
 * DELETE /api/lost-found/:id
 */
exports.deleteLostPet = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await lostPetModel.deleteLostPet(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Alert not found" });
    }
    return res.status(200).json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return res.status(500).json({ error: "Server error while deleting alert" });
  }
};
