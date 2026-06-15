const bcrypt = require('bcrypt');

async function generarHash() {
  const password = 'UNT12345*';
  const hash = await bcrypt.hash(password, 10);

  console.log('Contraseña:', password);
  console.log('Hash:', hash);
}

generarHash();
