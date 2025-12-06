const nodemailer = require('nodemailer');

/**
 * Email configuration for sending notifications
 */

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email content
 * @param {string} options.html - HTML email content
 * @returns {Promise<Object>} - Nodemailer info object
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Live Quiz App <noreply@livequizapp.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { transporter, sendEmail };