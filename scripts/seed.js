const pool = require('../db/pool');

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// 50 data destinasi wisata Indonesia (kompleksitas: kategori, provinsi, koordinat, fasilitas array, harga, rating)
const destinations = [
  ['Pantai Kuta', 'Pantai', 'Bali', 'Badung', 15000, 4.5, -8.7183, 115.1686, ['Parkir','Toilet','Warung','Sewa Papan Selancar'], '00:00 - 24:00'],
  ['Pantai Nusa Dua', 'Pantai', 'Bali', 'Badung', 25000, 4.6, -8.8008, 115.2317, ['Parkir','Toilet','Musholla','Resort'], '06:00 - 18:00'],
  ['Tanah Lot', 'Budaya', 'Bali', 'Tabanan', 60000, 4.7, -8.6212, 115.0868, ['Parkir','Toilet','Guide','Souvenir'], '07:00 - 19:00'],
  ['Ubud Monkey Forest', 'Taman', 'Bali', 'Gianyar', 80000, 4.4, -8.5194, 115.2586, ['Parkir','Toilet','Guide'], '08:30 - 18:00'],
  ['Gunung Bromo', 'Gunung', 'Jawa Timur', 'Probolinggo', 34000, 4.8, -7.9425, 112.9530, ['Parkir','Jeep Rental','Warung'], '00:00 - 24:00'],
  ['Kawah Ijen', 'Gunung', 'Jawa Timur', 'Banyuwangi', 100000, 4.6, -8.0581, 114.2422, ['Parkir','Guide','Sewa Masker Gas'], '01:00 - 12:00'],
  ['Malioboro', 'Budaya', 'DI Yogyakarta', 'Yogyakarta', 0, 4.5, -7.7925, 110.3654, ['Parkir','Toilet','Kuliner','Angkringan'], '00:00 - 24:00'],
  ['Candi Borobudur', 'Budaya', 'Jawa Tengah', 'Magelang', 50000, 4.8, -7.6079, 110.2038, ['Parkir','Toilet','Guide','Museum'], '06:00 - 17:00'],
  ['Candi Prambanan', 'Budaya', 'Jawa Tengah', 'Klaten', 50000, 4.7, -7.7520, 110.4915, ['Parkir','Toilet','Guide'], '06:00 - 17:00'],
  ['Kawah Putih', 'Gunung', 'Jawa Barat', 'Bandung', 30000, 4.5, -7.1663, 107.4021, ['Parkir','Toilet','Sewa Masker'], '07:00 - 17:00'],
  ['Tangkuban Perahu', 'Gunung', 'Jawa Barat', 'Bandung', 35000, 4.3, -6.7597, 107.6098, ['Parkir','Toilet','Warung'], '07:00 - 17:00'],
  ['Raja Ampat', 'Pantai', 'Papua Barat', 'Raja Ampat', 500000, 4.9, -0.2333, 130.5167, ['Diving Center','Homestay','Guide'], '00:00 - 24:00'],
  ['Danau Toba', 'Danau', 'Sumatera Utara', 'Samosir', 0, 4.7, 2.6845, 98.8756, ['Parkir','Penginapan','Kapal Wisata'], '00:00 - 24:00'],
  ['Pulau Komodo', 'Pantai', 'Nusa Tenggara Timur', 'Manggarai Barat', 150000, 4.8, -8.5455, 119.4894, ['Ranger','Guide','Kapal'], '07:00 - 17:00'],
  ['Gili Trawangan', 'Pantai', 'Nusa Tenggara Barat', 'Lombok Utara', 0, 4.6, -8.3496, 116.0417, ['Diving Center','Penginapan','Sepeda Sewa'], '00:00 - 24:00'],
  ['Pantai Pink Lombok', 'Pantai', 'Nusa Tenggara Barat', 'Lombok Timur', 10000, 4.4, -8.7333, 116.5167, ['Parkir','Warung'], '06:00 - 18:00'],
  ['Taman Mini Indonesia Indah', 'Taman', 'DKI Jakarta', 'Jakarta Timur', 25000, 4.3, -6.3024, 106.8951, ['Parkir','Toilet','Wahana','Museum'], '07:00 - 22:00'],
  ['Ancol Dreamland', 'Taman', 'DKI Jakarta', 'Jakarta Utara', 35000, 4.2, -6.1256, 106.8318, ['Parkir','Wahana','Pantai Buatan'], '05:00 - 24:00'],
  ['Kebun Raya Bogor', 'Taman', 'Jawa Barat', 'Bogor', 25000, 4.5, -6.5972, 106.7983, ['Parkir','Toilet','Guide'], '07:00 - 17:00'],
  ['Gunung Rinjani', 'Gunung', 'Nusa Tenggara Barat', 'Lombok Timur', 150000, 4.7, -8.4109, 116.4573, ['Basecamp','Porter','Guide'], '00:00 - 24:00'],
  ['Air Terjun Sekumpul', 'Air Terjun', 'Bali', 'Buleleng', 20000, 4.6, -8.1667, 115.1500, ['Parkir','Guide','Warung'], '08:00 - 17:00'],
  ['Air Terjun Madakaripura', 'Air Terjun', 'Jawa Timur', 'Probolinggo', 22000, 4.4, -7.9083, 113.0083, ['Parkir','Guide'], '07:00 - 17:00'],
  ['Danau Kelimutu', 'Danau', 'Nusa Tenggara Timur', 'Ende', 30000, 4.7, -8.7583, 121.8172, ['Parkir','Penginapan'], '04:00 - 18:00'],
  ['Pulau Derawan', 'Pantai', 'Kalimantan Timur', 'Berau', 20000, 4.6, 2.2833, 118.2500, ['Diving Center','Homestay'], '00:00 - 24:00'],
  ['Bukit Lawang', 'Hutan', 'Sumatera Utara', 'Langkat', 30000, 4.5, 3.5541, 98.1256, ['Guide','Penginapan','Trekking'], '07:00 - 17:00'],
  ['Museum Fatahillah', 'Museum', 'DKI Jakarta', 'Jakarta Barat', 5000, 4.1, -6.1352, 106.8133, ['Parkir','Guide'], '09:00 - 15:00'],
  ['Museum Angkut', 'Museum', 'Jawa Timur', 'Batu', 100000, 4.4, -7.8797, 112.5186, ['Parkir','Toilet','Kafe'], '12:00 - 20:00'],
  ['Jatim Park 2', 'Taman', 'Jawa Timur', 'Batu', 130000, 4.3, -7.8811, 112.5253, ['Parkir','Wahana','Kebun Binatang'], '08:30 - 16:30'],
  ['Taman Safari Indonesia', 'Taman', 'Jawa Barat', 'Bogor', 230000, 4.4, -6.7167, 106.9333, ['Parkir','Wahana','Kebun Binatang'], '08:30 - 17:00'],
  ['Pantai Parangtritis', 'Pantai', 'DI Yogyakarta', 'Bantul', 10000, 4.3, -8.0253, 110.3317, ['Parkir','Kuda Bendi','Warung'], '00:00 - 24:00'],
  ['Goa Pindul', 'Goa', 'DI Yogyakarta', 'Gunungkidul', 50000, 4.4, -7.9333, 110.6333, ['Guide','Pelampung','Parkir'], '07:00 - 17:00'],
  ['Nusa Penida', 'Pantai', 'Bali', 'Klungkung', 0, 4.7, -8.7274, 115.5444, ['Kapal','Guide','Sewa Motor'], '00:00 - 24:00'],
  ['Pantai Pandawa', 'Pantai', 'Bali', 'Badung', 20000, 4.5, -8.8497, 115.1911, ['Parkir','Toilet','Warung'], '07:00 - 19:00'],
  ['Grand Canyon Cirajang', 'Air Terjun', 'Jawa Barat', 'Garut', 25000, 4.2, -7.3167, 107.9167, ['Guide','Parkir'], '08:00 - 16:00'],
  ['Lawang Sewu', 'Budaya', 'Jawa Tengah', 'Semarang', 30000, 4.3, -6.9838, 110.4108, ['Parkir','Guide'], '07:00 - 21:00'],
  ['Dieng Plateau', 'Gunung', 'Jawa Tengah', 'Wonosobo', 20000, 4.6, -7.2010, 109.9086, ['Parkir','Penginapan','Guide'], '06:00 - 17:00'],
  ['Pantai Sanur', 'Pantai', 'Bali', 'Denpasar', 0, 4.4, -8.6813, 115.2624, ['Parkir','Sepeda Sewa','Warung'], '00:00 - 24:00'],
  ['Pantai Tanjung Aan', 'Pantai', 'Nusa Tenggara Barat', 'Lombok Tengah', 10000, 4.5, -8.8858, 116.2894, ['Parkir','Warung'], '06:00 - 18:00'],
  ['Bukit Bintang Jogja', 'Taman', 'DI Yogyakarta', 'Gunungkidul', 5000, 4.2, -7.8608, 110.5194, ['Parkir','Kafe'], '17:00 - 24:00'],
  ['Curug Cimahi Rainbow', 'Air Terjun', 'Jawa Barat', 'Bandung Barat', 25000, 4.1, -6.7994, 107.5589, ['Parkir','Lampu Warna-warni'], '15:00 - 21:00'],
  ['Pantai Ora', 'Pantai', 'Maluku', 'Seram Bagian Barat', 50000, 4.8, -3.1167, 128.6000, ['Resort','Diving Center'], '00:00 - 24:00'],
  ['Wakatobi', 'Pantai', 'Sulawesi Tenggara', 'Wakatobi', 0, 4.8, -5.3333, 123.7500, ['Diving Center','Resort'], '00:00 - 24:00'],
  ['Bunaken', 'Pantai', 'Sulawesi Utara', 'Manado', 50000, 4.7, 1.6215, 124.7620, ['Diving Center','Kapal'], '07:00 - 17:00'],
  ['Danau Sentani', 'Danau', 'Papua', 'Jayapura', 0, 4.4, -2.5975, 140.5197, ['Kapal Wisata','Parkir'], '00:00 - 24:00'],
  ['Pantai Papuma', 'Pantai', 'Jawa Timur', 'Jember', 15000, 4.3, -8.4306, 113.5231, ['Parkir','Penginapan'], '06:00 - 18:00'],
  ['Green Canyon Pangandaran', 'Air Terjun', 'Jawa Barat', 'Pangandaran', 40000, 4.5, -7.5833, 108.4667, ['Guide','Perahu'], '07:00 - 15:00'],
  ['Kepulauan Seribu', 'Pantai', 'DKI Jakarta', 'Kepulauan Seribu', 0, 4.3, -5.7500, 106.5833, ['Kapal','Resort','Diving Center'], '00:00 - 24:00'],
  ['Pantai Ngobaran', 'Pantai', 'DI Yogyakarta', 'Gunungkidul', 10000, 4.3, -8.1608, 110.5147, ['Parkir','Pura'], '06:00 - 18:00'],
  ['Puncak Bogor', 'Gunung', 'Jawa Barat', 'Bogor', 0, 4.2, -6.7000, 106.9833, ['Parkir','Kebun Teh','Kafe'], '00:00 - 24:00'],
  ['Pantai Klayar', 'Pantai', 'Jawa Timur', 'Pacitan', 15000, 4.6, -8.2114, 111.0989, ['Parkir','Warung'], '06:00 - 18:00'],
];

const reviewerNames = ['Andi','Budi','Citra','Dewi','Eka','Fajar','Gita','Hendra','Intan','Joko','Kiki','Lina','Made','Nita','Oki','Putri','Rian','Sinta','Tono','Umi'];

const comments = [
  'Tempatnya bagus banget, view-nya juara!',
  'Recommended untuk liburan keluarga.',
  'Aksesnya agak susah tapi worth it.',
  'Fasilitas lengkap dan bersih.',
  'Harga tiket terjangkau, pengalaman memuaskan.',
  'Pemandangannya luar biasa, cocok buat foto-foto.',
  'Ramai banget saat weekend, sebaiknya datang pagi.',
  'Kurang terawat, tapi tetap indah.',
  'Pelayanan ramah, akan kembali lagi ke sini.',
  'Wajib dikunjungi kalau lagi ke daerah ini.',
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Membersihkan data lama...');
    await client.query('TRUNCATE TABLE reviews, destinations RESTART IDENTITY CASCADE');

    console.log(`Menambahkan ${destinations.length} destinasi wisata...`);
    const insertedIds = [];

    for (const d of destinations) {
      const [name, category, province, city, price, rating, lat, lng, facilities, hours] = d;
      const slug = slugify(name);
      const result = await client.query(
        `INSERT INTO destinations
         (name, slug, category, province, city, description, price_ticket, rating, latitude, longitude, facilities, opening_hours, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
        [
          name, slug, category, province, city,
          `${name} adalah destinasi wisata kategori ${category.toLowerCase()} yang terletak di ${city}, ${province}.`,
          price, rating, lat, lng, facilities, hours,
          `https://picsum.photos/seed/${slug}/640/400`,
        ]
      );
      insertedIds.push(result.rows[0].id);
    }

    console.log('Menambahkan data review (relasi many-to-one)...');
    let reviewCount = 0;
    for (const destId of insertedIds) {
      const numReviews = 2 + Math.floor(Math.random() * 3); // 2-4 review per destinasi
      for (let i = 0; i < numReviews; i++) {
        const reviewer = reviewerNames[Math.floor(Math.random() * reviewerNames.length)];
        const comment = comments[Math.floor(Math.random() * comments.length)];
        const rating = 3 + Math.floor(Math.random() * 3); // 3-5
        await client.query(
          'INSERT INTO reviews (destination_id, reviewer_name, rating, comment) VALUES ($1,$2,$3,$4)',
          [destId, reviewer, rating, comment]
        );
        reviewCount++;
      }
    }

    console.log(`✅ Seed selesai: ${insertedIds.length} destinasi, ${reviewCount} review.`);
  } catch (err) {
    console.error('❌ Seed gagal:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
