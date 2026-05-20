const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'iconlogo.jpg');
const destination = path.join(__dirname, '..', 'public', 'iconlogo.jpg');

try {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
    console.log('✅ Copiado iconlogo.jpg a public/iconlogo.jpg con éxito!');
  } else {
    console.error('❌ No se encontró iconlogo.jpg en la raíz del proyecto.');
  }
} catch (err) {
  console.error('❌ Error al copiar el archivo:', err);
}
