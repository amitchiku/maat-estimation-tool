import fs from 'fs';
import path from 'path';

function updateCatalogFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);

  if (data.materials) {
    data.materials = data.materials.map(m => {
      delete m.allowance;
      m.tax = 0.06;
      m.markup = 0.25;
      m.grossPrice = Math.round((m.netPrice || 0) * 1.06 * 1.25 * 100) / 100;
      return m;
    });
  }

  if (data.equipment) {
    data.equipment = data.equipment.map(e => {
      delete e.allowance;
      e.tax = 0.0;
      e.markup = 0.25;
      e.grossPrice = Math.round((e.netPrice || 0) * 1.0 * 1.25 * 100) / 100;
      return e;
    });
  }

  if (data.settings && data.settings.defaults) {
    delete data.settings.defaults.materialAllowance;
    delete data.settings.defaults.equipmentAllowance;
    data.settings.defaults.materialTax = 6;
    data.settings.defaults.materialMarkup = 25;
    data.settings.defaults.equipmentTax = 0;
    data.settings.defaults.equipmentMarkup = 25;
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${filePath}`);
}

updateCatalogFile(path.resolve('./data/catalog.json'));
updateCatalogFile(path.resolve('./data/seed.json'));
