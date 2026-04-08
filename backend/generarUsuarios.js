const bcrypt = require('bcrypt');

async function generar() {
  const admin = await bcrypt.hash('Admin123', 10);
  const residente = await bcrypt.hash('Residente123', 10);
  const supervisor = await bcrypt.hash('Supervisor123', 10);

  console.log('ADMIN:', admin);
  console.log('RESIDENTE:', residente);
  console.log('SUPERVISOR:', supervisor);
}

generar();