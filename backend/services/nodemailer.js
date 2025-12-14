const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // CLAVE
  },
});


transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Error SMTP:", error);
  } else {
    console.log("✅ SMTP listo para enviar mails");
  }
});


async function sendForgotPasswordEmail(to, resetUrl) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Recuperación de contraseña',
    html: `
      <p>Pediste restablecer tu contraseña.</p>
      <p>Este enlace es válido por <b>1 hora</b>:</p>
      <p><a href="${resetUrl}">Restablece tu contraseña Aqui</a></p>
      <p>Si no lo pediste, ignorá este correo.</p>
    `,
  });
}

module.exports = { sendForgotPasswordEmail };
