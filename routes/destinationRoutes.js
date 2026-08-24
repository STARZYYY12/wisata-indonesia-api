const express = require('express');
const router = express.Router();
const authApiKey = require('../middleware/authApiKey');
const {
  getDestinations, getDestinationDetail, getCategories, getProvinces, addReview,
} = require('../controllers/destinationController');

router.use(authApiKey); // semua route data wajib pakai x-api-key

router.get('/destinations', getDestinations);
router.get('/destinations/:idOrSlug', getDestinationDetail);
router.post('/destinations/:id/reviews', addReview);
router.get('/categories', getCategories);
router.get('/provinces', getProvinces);

module.exports = router;
