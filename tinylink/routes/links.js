// routes/links.js - All Application Routes
const express = require('express');
const router = express.Router();
const db = require('../config/db.js');

// Dashboard - List all links
router.get('/', (req, res) => {
  db.all('SELECT * FROM links ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Server Error');
    }
    res.render('dashboard', { links: rows || [] });
  });
});

// Redirect short URL
router.get('/:code', (req, res) => {
  const { code } = req.params;
  
  // Validate code format
  if (!isValidCode(code)) {
    return res.status(404).send('Link not found');
  }
  
  db.get('SELECT * FROM links WHERE code = ?', [code], (err, row) => {
    if (err || !row) {
      return res.status(404).send('Link not found');
    }
    
    // Update click count
    db.run(
      'UPDATE links SET clicks = clicks + 1, last_clicked = datetime("now") WHERE code = ?',
      [code],
      (updateErr) => {
        if (updateErr) {
          console.error('Update error:', updateErr);
        }
        res.redirect(302, row.original_url);
      }
    );
  });
});

// Stats page for a single code
router.get('/code/:code', (req, res) => {
  const { code } = req.params;
  
  if (!isValidCode(code)) {
    return res.status(404).send('Link not found');
  }
  
  db.get('SELECT * FROM links WHERE code = ?', [code], (err, row) => {
    if (err || !row) {
      return res.status(404).send('Link not found');
    }
    res.render('stats', { link: row });
  });
});

// API ROUTES

// POST /api/links - Create link (409 if code exists)
router.post('/api/links', (req, res) => {
  const { original_url, code } = req.body;
  
  console.log('Creating link:', { original_url, code });

  // Validation
  if (!original_url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  // URL validation
  if (!isValidUrl(original_url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
  
  const shortCode = code || generateRandomCode(6);
  
  // Code format validation
  if (!isValidCode(shortCode)) {
    return res.status(400).json({ 
      error: 'Code must be 6-8 characters and contain only letters and numbers' 
    });
  }
  
  // Check if code already exists
  db.get('SELECT * FROM links WHERE code = ?', [shortCode], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
    
    if (row) {
      return res.status(409).json({ error: 'Code already exists' });
    }
    
    // Insert new link
    db.run(
      'INSERT INTO links (code, original_url) VALUES (?, ?)',
      [shortCode, original_url],
      function(err) {
        if (err) {
          console.error('Insert error:', err);
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Code already exists' });
          }
          return res.status(500).json({ error: 'Failed to create link' });
        }
        
        console.log('Link created:', shortCode);
        
        // Return created link data
        res.status(201).json({
          code: shortCode,
          original_url: original_url,
          clicks: 0,
          last_clicked: null,
          created_at: new Date().toISOString()
        });
      }
    );
  });
});

// GET /api/links - List all links
router.get('/api/links', (req, res) => {
  db.all('SELECT * FROM links ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
    res.json(rows.map(link => ({
      code: link.code,
      original_url: link.original_url,
      clicks: link.clicks,
      last_clicked: link.last_clicked,
      created_at: link.created_at
    })));
  });
});

// GET /api/links/:code - Stats for one code
router.get('/api/links/:code', (req, res) => {
  const { code } = req.params;
  
  if (!isValidCode(code)) {
    return res.status(400).json({ error: 'Invalid code format' });
  }
  
  db.get('SELECT * FROM links WHERE code = ?', [code], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json({
      code: row.code,
      original_url: row.original_url,
      clicks: row.clicks,
      last_clicked: row.last_clicked,
      created_at: row.created_at
    });
  });
});

// DELETE /api/links/:code - Delete link
router.delete('/api/links/:code', (req, res) => {
  const { code } = req.params;
  
  if (!isValidCode(code)) {
    return res.status(400).json({ error: 'Invalid code format' });
  }
  
  db.run('DELETE FROM links WHERE code = ?', [code], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    console.log('Link deleted:', code);
    res.json({ 
      message: 'Link deleted successfully',
      code: code
    });
  });
});

// HELPER FUNCTIONS

// Generate random code (6-8 characters)
function generateRandomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const codeLength = Math.floor(Math.random() * 3) + 6; // 6, 7, or 8
  
  for (let i = 0; i < codeLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Validate code format: [A-Za-z0-9]{6,8}
function isValidCode(code) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

// Validate URL format
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

module.exports = router;