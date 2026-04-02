// Utilidad para generar códigos de barras (RF32)
const bwipjs = require('bwip-js');

/**
 * Genera una imagen de código de barras en formato PNG (buffer)
 * @param {string} text - Texto a codificar
 * @param {string} type - Tipo de código (code128, ean13, etc.)
 * @returns {Promise<Buffer>} Imagen PNG del código de barras
 */
async function generateBarcode(text, type = 'code128') {
  try {
    const png = await bwipjs.toBuffer({
      bcid: type,
      text: text,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });
    return png;
  } catch (error) {
    throw new Error(`Error al generar código de barras: ${error.message}`);
  }
}

/**
 * Genera un SKU único para una variante de producto
 * @param {string} productName - Nombre del producto
 * @param {string} size - Talla
 * @param {string} color - Color
 * @returns {string} SKU generado
 */
function generateSKU(productName, size, color) {
  const prefix = productName.substring(0, 3).toUpperCase().replace(/\s/g, '');
  const sizeCode = size.toUpperCase().substring(0, 3);
  const colorCode = color.toUpperCase().substring(0, 3);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${sizeCode}-${colorCode}-${random}`;
}

module.exports = { generateBarcode, generateSKU };
