const express = require('express');
const Link = require('../../models/Link');
const { validateCreateLink, validateCodeParam } = require('../../middleware/validation');
const router = express.Router();

// GET /api/links - List all links
router.get('/', async (req, res) => {
  try {
    const links = await Link.findAll();
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// POST /api/links - Create new link
router.post('/', validateCreateLink, async (req, res) => {
  try {
    const { originalUrl, code } = req.body;

    // Generate code if not provided
    let shortCode = code;
    if (!shortCode || shortCode.trim() === '') {
      // Use model's random code generator
      shortCode = Link.generateRandomCode(6);
    } else {
      shortCode = shortCode.trim();
    }

    // Use model's validation
    if (!Link.isValidCode(shortCode)) {
      return res.status(400).json({ 
        error: 'Code must be 6-8 characters and contain only letters and numbers' 
      });
    }

    if (!Link.isValidUrl(originalUrl)) {
      return res.status(400).json({ 
        error: 'Invalid URL format. Must start with http:// or https://' 
      });
    }

    // Check if code exists using model method
    if (await Link.codeExists(shortCode)) {
      return res.status(409).json({ error: 'Code already exists' });
    }

    // Create link using model (which has its own validation)
    const link = await Link.create({
      code: shortCode,
      originalUrl: originalUrl.trim()
    });

    const shortUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/${link.code}`;

    res.status(201).json({
      ...link,
      shortUrl: shortUrl
    });

  } catch (error) {
    console.error('Create link error:', error);
    
    // Handle specific errors from model
    if (error.message === 'Code already exists') {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes('must be') || error.message.includes('Invalid URL')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create link' });
  }
});

// GET /api/links/:code - Get link stats
router.get('/:code', validateCodeParam, async (req, res) => {
  try {
    const { code } = req.params;
    const link = await Link.findByCode(code);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(link);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch link' });
  }
});

// DELETE /api/links/:code - Delete link
router.delete('/:code', validateCodeParam, async (req, res) => {
  try {
    const { code } = req.params;
    
    // Delete using model (which handles not found case)
    await Link.delete(code);
    
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    if (error.message === 'Link not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

module.exports = router;