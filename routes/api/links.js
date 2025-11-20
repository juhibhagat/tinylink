const express = require('express');
const Link = require('../../models/Link');
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
router.post('/', async (req, res) => {
  try {
    const { originalUrl, code } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    try {
      new URL(originalUrl);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Generate code if not provided
    let shortCode = code;
    if (!shortCode) {
      shortCode = Math.random().toString(36).substring(2, 8);
    }

    // Validate code format
    if (!/^[A-Za-z0-9]{1,10}$/.test(shortCode)) {
      return res.status(400).json({ error: 'Code can only contain letters and numbers (1-10 characters)' });
    }

    // Check if code exists
    if (await Link.codeExists(shortCode)) {
      return res.status(409).json({ error: 'Code already exists' });
    }

    // Create link
    const link = await Link.create({
      code: shortCode,
      originalUrl: originalUrl
    });

    const shortUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/${link.code}`;

    res.status(201).json({
      ...link,
      shortUrl: shortUrl
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to create link' });
  }
});

// GET /api/links/:code - Get link stats
router.get('/:code', async (req, res) => {
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
router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const link = await Link.findByCode(code);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    await Link.delete(code);
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

module.exports = router;