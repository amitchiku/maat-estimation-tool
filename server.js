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

// Reset / Initialize catalog if not exists
function getCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    if (fs.existsSync(SEED_PATH)) {
      fs.copyFileSync(SEED_PATH, CATALOG_PATH);
    } else {
      // Fallback empty catalog structure
      fs.writeFileSync(CATALOG_PATH, JSON.stringify({ materials: [], equipment: [], labor: [], assemblies: [] }, null, 2));
    }
  }
  try {
    return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  } catch (err) {
    console.error('Error reading catalog file:', err);
    return { materials: [], equipment: [], labor: [], assemblies: [] };
  }
}

// REST Endpoints
app.get('/api/catalog', (req, res) => {
  res.json(getCatalog());
});

app.post('/api/catalog', (req, res) => {
  try {
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(req.body, null, 2));
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
