import express from 'express';
import fs from 'fs';
import path from 'path';

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

process.on('exit', (code) => {
  console.log(`PROCESS EXITING WITH CODE: ${code}`);
});

const app = express();
const PORT = process.env.PORT || 8085;

app.use(express.json({ limit: '50mb' }));

const DATA_DIR = path.resolve('./data');
const QUOTES_DIR = path.join(DATA_DIR, 'quotes');
const CATALOG_PATH = path.join(DATA_DIR, 'catalog.json');
const SEED_PATH = path.join(DATA_DIR, 'seed.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(QUOTES_DIR)) {
  fs.mkdirSync(QUOTES_DIR, { recursive: true });
}

function normalizeType(type) {
  if (!type) return null;
  const t = String(type).trim().toLowerCase();
  if (t === 'lineitems' || t === 'line_items' || t === 'assemblies') return 'line_items';
  if (t === 'materials') return 'materials';
  if (t === 'labor') return 'labor';
  if (t === 'equipment') return 'equipment';
  return null;
}

function getCatalogFile(type) {
  const norm = normalizeType(type);
  if (!norm) return null;
  return path.join(DATA_DIR, `${norm}.json`);
}

function getCatalog(type) {
  if (!type) {
    const materials = getCatalog('materials') || [];
    const labor = getCatalog('labor') || [];
    const equipment = getCatalog('equipment') || [];
    const lineItems = getCatalog('line_items') || [];
    return { materials, labor, equipment, lineItems, assemblies: lineItems };
  }

  const filePath = getCatalogFile(type);
  if (!filePath || !fs.existsSync(filePath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Error reading catalog file for ${type}:`, err);
    return [];
  }
}

function upsertCatalog(type, data) {
  if (!type) {
    if (Array.isArray(data)) {
      return upsertCatalog('line_items', data);
    }
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data.materials)) upsertCatalog('materials', data.materials);
      if (Array.isArray(data.labor)) upsertCatalog('labor', data.labor);
      if (Array.isArray(data.equipment)) upsertCatalog('equipment', data.equipment);
      if (Array.isArray(data.lineItems)) upsertCatalog('line_items', data.lineItems);
      else if (Array.isArray(data.assemblies)) upsertCatalog('line_items', data.assemblies);
      return true;
    }
    throw new Error('Invalid catalog payload');
  }

  const filePath = getCatalogFile(type);
  if (!filePath) throw new Error(`Invalid catalog type: ${type}`);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return true;
}

// REST Endpoints
app.get('/api/catalog', (req, res) => {
  const type = req.query.type;
  res.json(getCatalog(type));
});

app.get('/api/catalog/:type', (req, res) => {
  const type = req.params.type;
  res.json(getCatalog(type));
});

app.post('/api/catalog/:type', (req, res) => {
  try {
    const type = req.params.type;
    upsertCatalog(type, req.body);
    res.json({ success: true, message: `Catalog ${type} saved successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/catalog', (req, res) => {
  try {
    const type = req.query.type || (req.body && req.body.type);
    const payload = (req.body && req.body.data !== undefined) ? req.body.data : req.body;
    upsertCatalog(type || null, payload);
    res.json({ success: true, message: 'Catalog saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/quotes', (req, res) => {
  try {
    const files = fs.readdirSync(QUOTES_DIR);
    const quotes = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        try {
          const content = fs.readFileSync(path.join(QUOTES_DIR, file), 'utf-8');
          const data = JSON.parse(content);
          return {
            id: data.id || path.basename(file, '.json'),
            name: data.name || 'Unnamed Quote',
            clientName: data.clientName || 'Unknown Client',
            date: data.date || new Date().toISOString(),
            status: data.status || 'Draft',
            grandTotal: data.grandTotal || 0,
            roomCount: data.rooms ? data.rooms.length : 0
          };
        } catch (e) {
          console.error(`Error parsing quote file ${file}:`, e);
          return null;
        }
      })
      .filter(Boolean);
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/quotes/:id', (req, res) => {
  const quotePath = path.join(QUOTES_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(quotePath)) {
    return res.status(404).json({ success: false, error: 'Quote not found' });
  }
  try {
    const data = JSON.parse(fs.readFileSync(quotePath, 'utf-8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/quotes', (req, res) => {
  try {
    const quote = req.body;
    if (!quote.id) {
      quote.id = `quote_${Date.now()}`;
    }
    const quotePath = path.join(QUOTES_DIR, `${quote.id}.json`);
    fs.writeFileSync(quotePath, JSON.stringify(quote, null, 2));
    res.json({ success: true, id: quote.id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/quotes/:id', (req, res) => {
  const quotePath = path.join(QUOTES_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(quotePath)) {
    return res.status(404).json({ success: false, error: 'Quote not found' });
  }
  try {
    fs.unlinkSync(quotePath);
    res.json({ success: true, message: 'Quote deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Mock Estimating Server listening on port ${PORT}`);
});
