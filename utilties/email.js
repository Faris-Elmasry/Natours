const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");
const AppError = require("./appError");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Faris Mounir <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // PRODUCTION EMAIL PROVIDERS

      // Option 1: Sendgrid (RECOMMENDED - Works great in Egypt)
      if (process.env.SENDGRID_API_KEY) {
        return nodemailer.createTransport({
          host: "smtp.sendgrid.net",
          port: 587,
          auth: {
            user: "apikey",
            pass: process.env.SENDGRID_API_KEY,
          },
        });
      }

      // Option 2: Brevo/Sendinblue (Great for Egypt)
      if (process.env.BREVO_SMTP_KEY) {
        return nodemailer.createTransport({
          host: "smtp-relay.brevo.com",
          port: 587,
          auth: {
            user: process.env.BREVO_EMAIL,
            pass: process.env.BREVO_SMTP_KEY,
          },
        });
      }

      // Option 3: Gmail (Use App Password, has 500/day limit)
      if (process.env.GMAIL_EMAIL_USERNAME) {
        return nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_EMAIL_USERNAME,
            pass: process.env.GMAIL_EMAIL_PASSWORD,
          },
        });
      }

      // Fallback to development if no production config
      console.warn(
        "⚠️  No production email service configured. Using development settings."
      );
    }

    // DEVELOPMENT (Mailtrap or similar)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    try {
      await this.newTransport().sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new AppError("There was an error sending the email. Try again later.", 500);
    }
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
