const express = require('express');
const Link = require('../../models/Link');
const router = express.Router();

// GET /:code - Redirect to original URL
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const link = await Link.findByCode(code);

    if (!link) {
      return res.status(404).send('Link not found');
    }

    // Increment click count
    await Link.incrementClicks(code);

    // Redirect to original URL
    res.redirect(302, link.original_url);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;