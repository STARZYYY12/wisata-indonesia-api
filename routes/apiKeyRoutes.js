const express = require('express');
const router = express.Router();
const authJwt = require('../middleware/authJwt');
const {
  createApiKey, listApiKeys, revokeApiKey, deleteApiKey,
} = require('../controllers/apiKeyController');

router.use(authJwt); // semua route di bawah ini wajib JWT

router.post('/', createApiKey);
router.get('/', listApiKeys);
router.patch('/:id/revoke', revokeApiKey);
router.delete('/:id', deleteApiKey);

module.exports = router;
