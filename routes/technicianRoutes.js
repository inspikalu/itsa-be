const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/example', (req, res) => {
    res.send('Admin route example');
});

module.exports = router;
