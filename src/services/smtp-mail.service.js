const tls = require('tls');

function getSmtpConfig() {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const password = process.env.SMTP_PASSWORD || '';
  const from = (process.env.SMTP_FROM || user).trim();
  const port = Number(process.env.SMTP_PORT || 465);

  if (!host || !user || !password || !from || !Number.isInteger(port)) return null;

  return { host, user, password, from, port };
}

function waitForResponse(socket, acceptedCodes) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const timeout = setTimeout(() => finish(new Error('El servidor de correo no respondio a tiempo.')), 12000);

    function cleanup() {
      clearTimeout(timeout);
      socket.removeListener('data', onData);
      socket.removeListener('error', onError);
    }

    function finish(error, response) {
      cleanup();
      if (error) reject(error);
      else resolve(response);
    }

    function onError(error) {
      finish(error);
    }

    function onData(chunk) {
      buffer += chunk;
      const lines = buffer.split('\r\n');
      buffer = lines.pop();

      for (const line of lines) {
        const match = /^(\d{3})([ -])/.exec(line);
        if (!match || match[2] !== ' ') continue;

        const code = Number(match[1]);
        if (!acceptedCodes.includes(code)) {
          return finish(new Error(`El servidor de correo respondio con el codigo ${code}.`));
        }

        return finish(null, line);
      }
    }

    socket.on('data', onData);
    socket.once('error', onError);
  });
}

async function sendCommand(socket, command, acceptedCodes) {
  socket.write(`${command}\r\n`);
  await waitForResponse(socket, acceptedCodes);
}

function buildPasswordResetMessage({ to, name, resetUrl }) {
  const safeName = String(name || 'usuario').replace(/[\r\n]/g, ' ').trim();

  return [
    'Subject: Restablecimiento de contrasena - Bienestar UNT',
    `To: ${to}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    `Hola ${safeName},`,
    '',
    'Recibimos una solicitud para restablecer la contrasena de tu cuenta.',
    'Usa el siguiente enlace dentro de los proximos 15 minutos:',
    resetUrl,
    '',
    'Si no solicitaste este cambio, puedes ignorar este mensaje.',
    '',
    'Bienestar UNT'
  ].join('\r\n');
}

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const config = getSmtpConfig();
  if (!config) throw new Error('SMTP_NOT_CONFIGURED');

  const socket = tls.connect({
    host: config.host,
    port: config.port,
    servername: config.host,
    minVersion: 'TLSv1.2'
  });

  try {
    const greeting = waitForResponse(socket, [220]);
    await new Promise((resolve, reject) => {
      socket.once('secureConnect', resolve);
      socket.once('error', reject);
    });

    await greeting;
    await sendCommand(socket, 'EHLO bienestar-unt', [250]);
    await sendCommand(socket, 'AUTH LOGIN', [334]);
    await sendCommand(socket, Buffer.from(config.user).toString('base64'), [334]);
    await sendCommand(socket, Buffer.from(config.password).toString('base64'), [235]);
    await sendCommand(socket, `MAIL FROM:<${config.from}>`, [250]);
    await sendCommand(socket, `RCPT TO:<${to}>`, [250, 251]);
    await sendCommand(socket, 'DATA', [354]);

    const message = buildPasswordResetMessage({ to, name, resetUrl })
      .replace(/^\./gm, '..');
    await sendCommand(socket, `${message}\r\n.`, [250]);
    await sendCommand(socket, 'QUIT', [221]);
  } finally {
    socket.end();
  }
}

module.exports = {
  sendPasswordResetEmail
};
