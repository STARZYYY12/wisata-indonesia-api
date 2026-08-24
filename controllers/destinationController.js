const pool = require('../db/pool');

// GET /api/v1/destinations?category=&province=&city=&min_rating=&max_price=&page=&limit=
async function getDestinations(req, res) {
  const {
    category, province, city, min_rating, max_price, search,
    page = 1, limit = 10, sort = 'rating_desc',
  } = req.query;

  const conditions = ['is_active = TRUE'];
  const values = [];
  let idx = 1;

  if (category) { conditions.push(`category ILIKE $${idx++}`); values.push(category); }
  if (province) { conditions.push(`province ILIKE $${idx++}`); values.push(province); }
  if (city) { conditions.push(`city ILIKE $${idx++}`); values.push(city); }
  if (min_rating) { conditions.push(`rating >= $${idx++}`); values.push(min_rating); }
  if (max_price) { conditions.push(`price_ticket <= $${idx++}`); values.push(max_price); }
  if (search) { conditions.push(`name ILIKE $${idx++}`); values.push(`%${search}%`); }

  const sortMap = {
    rating_desc: 'rating DESC',
    rating_asc: 'rating ASC',
    price_asc: 'price_ticket ASC',
    price_desc: 'price_ticket DESC',
    newest: 'created_at DESC',
  };
  const orderBy = sortMap[sort] || sortMap.rating_desc;

  const limitNum = Math.min(parseInt(limit) || 10, 50);
  const offset = (Math.max(parseInt(page) || 1, 1) - 1) * limitNum;

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await pool.query(`SELECT COUNT(*) FROM destinations ${whereClause}`, values);
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await pool.query(
      `SELECT id, name, slug, category, province, city, price_ticket, rating, image_url
       FROM destinations ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limitNum, offset]
    );

    return res.json({
      success: true,
      pagination: { total, page: Number(page), limit: limitNum, total_pages: Math.ceil(total / limitNum) },
      data: dataResult.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data destinasi.' });
  }
}

// GET /api/v1/destinations/:idOrSlug
async function getDestinationDetail(req, res) {
  const { idOrSlug } = req.params;
  const isNumeric = /^\d+$/.test(idOrSlug);

  try {
    const result = await pool.query(
      `SELECT * FROM destinations WHERE ${isNumeric ? 'id = $1' : 'slug = $1'} AND is_active = TRUE`,
      [idOrSlug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Destinasi tidak ditemukan.' });
    }

    const reviewsResult = await pool.query(
      'SELECT reviewer_name, rating, comment, created_at FROM reviews WHERE destination_id = $1 ORDER BY created_at DESC LIMIT 10',
      [result.rows[0].id]
    );

    return res.json({ success: true, data: { ...result.rows[0], reviews: reviewsResult.rows } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail destinasi.' });
  }
}

// GET /api/v1/categories
async function getCategories(req, res) {
  try {
    const result = await pool.query(
      'SELECT category, COUNT(*)::int as total FROM destinations WHERE is_active = TRUE GROUP BY category ORDER BY total DESC'
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil kategori.' });
  }
}

// GET /api/v1/provinces
async function getProvinces(req, res) {
  try {
    const result = await pool.query(
      'SELECT province, COUNT(*)::int as total FROM destinations WHERE is_active = TRUE GROUP BY province ORDER BY total DESC'
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil provinsi.' });
  }
}

// POST /api/v1/destinations/:id/reviews (API key protected)
async function addReview(req, res) {
  const { id } = req.params;
  const { reviewer_name, rating, comment } = req.body;

  if (!reviewer_name || !rating) {
    return res.status(400).json({ success: false, message: 'reviewer_name dan rating wajib diisi.' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'rating harus antara 1-5.' });
  }

  try {
    const dest = await pool.query('SELECT id FROM destinations WHERE id = $1', [id]);
    if (dest.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Destinasi tidak ditemukan.' });
    }

    const result = await pool.query(
      'INSERT INTO reviews (destination_id, reviewer_name, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *',
      [id, reviewer_name, rating, comment]
    );

    // update rating rata-rata destinasi
    await pool.query(
      `UPDATE destinations SET rating = (SELECT ROUND(AVG(rating)::numeric,1) FROM reviews WHERE destination_id = $1) WHERE id = $1`,
      [id]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Gagal menambahkan review.' });
  }
}

module.exports = { getDestinations, getDestinationDetail, getCategories, getProvinces, addReview };
