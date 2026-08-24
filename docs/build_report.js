const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, Table, TableRow,
  TableCell, WidthType, ShadingType, AlignmentType, PageBreak, BorderStyle,
} = require('docx');

const BLUE = '1e3a8a';

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 200 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 150 } });
}
function p(text, opts = {}) {
  return new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 150 } });
}
function bullet(text) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 80 } });
}
function imageParagraph(path, width, height) {
  const data = fs.readFileSync(path);
  return new Paragraph({
    children: [new ImageRun({ data, transformation: { width, height }, type: 'png' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  });
}
function caption(text) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, size: 20, color: '555555' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
  });
}

function cell(text, opts = {}) {
  return new TableCell({
    width: { size: opts.width || 2000, type: WidthType.DXA },
    shading: opts.header ? { type: ShadingType.CLEAR, fill: '2563EB' } : undefined,
    children: [new Paragraph({
      children: [new TextRun({ text, bold: !!opts.header, color: opts.header ? 'FFFFFF' : '000000', size: 19 })],
    })],
  });
}

function simpleTable(headers, rows, widths) {
  const headerRow = new TableRow({ children: headers.map((h, i) => cell(h, { header: true, width: widths[i] })) });
  const dataRows = rows.map((r) => new TableRow({ children: r.map((c, i) => cell(String(c), { width: widths[i] })) }));
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    rows: [headerRow, ...dataRows],
  });
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 22 } },
    },
  },
  sections: [
    {
      properties: { page: { size: { width: 11907, height: 16840 } } }, // A4
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'LAPORAN PERANCANGAN SISTEM', bold: true, size: 44, color: BLUE })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'WISATA INDONESIA API', bold: true, size: 36, color: BLUE })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'SaaS Penyedia Data Destinasi Wisata Indonesia berbasis API Key & JWT', italics: true, size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Tech Stack: Express.js · PostgreSQL (Supabase) · Vercel', size: 22, color: '444444' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
        }),

        h1('1. Pendahuluan'),
        p('Wisata Indonesia API adalah layanan Software as a Service (SaaS) yang menyediakan data destinasi wisata di seluruh Indonesia untuk dikonsumsi oleh developer/aplikasi pihak ketiga, mengikuti pola bisnis yang sama dengan layanan seperti OpenRouter atau WeatherAPI: pengguna mendaftar akun, melakukan autentikasi, membuat API key, lalu menggunakan API key tersebut untuk mengakses data melalui endpoint REST.'),
        p('Sistem ini menggunakan dua lapis autentikasi:'),
        bullet('JWT (JSON Web Token) — untuk autentikasi pengguna saat login dan mengelola akun/API key pada dashboard.'),
        bullet('API Key — untuk autentikasi permintaan data pada endpoint publik yang dikonsumsi aplikasi pihak ketiga.'),

        h2('1.1 Tujuan'),
        bullet('Menyediakan data wisata Indonesia (50+ destinasi) yang dapat diakses secara terprogram.'),
        bullet('Menerapkan sistem otentikasi berlapis (JWT untuk akun, API Key untuk konsumsi data).'),
        bullet('Mencatat pemakaian API (request log) untuk keperluan monitoring/rate-limit di masa depan.'),

        h2('1.2 Ruang Lingkup'),
        bullet('Registrasi & login pengguna (JWT).'),
        bullet('Manajemen API key (create, list, revoke, delete).'),
        bullet('Endpoint data: daftar destinasi, detail destinasi, kategori, provinsi, dan review.'),
        bullet('Deployment pada platform Vercel dengan database PostgreSQL (Supabase).'),

        new Paragraph({ children: [new PageBreak()] }),

        h1('2. Teknologi yang Digunakan'),
        simpleTable(
          ['Komponen', 'Teknologi', 'Keterangan'],
          [
            ['Backend Framework', 'Express.js', 'Routing, middleware, REST API'],
            ['Database', 'PostgreSQL (Supabase)', '5 tabel relasional'],
            ['Autentikasi Akun', 'JWT (jsonwebtoken)', 'Login & proteksi endpoint manajemen'],
            ['Autentikasi Data', 'API Key custom', 'Header x-api-key pada tiap request'],
            ['Hashing Password', 'bcryptjs', 'Password di-hash sebelum disimpan'],
            ['Hosting/Deploy', 'Vercel (Serverless Functions)', 'Auto-deploy dari GitHub'],
          ],
          [2600, 2800, 3500]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        h1('3. Entity Relationship Diagram (ERD)'),
        p('Struktur basis data terdiri dari 5 tabel utama: users, api_keys, destinations, reviews, dan api_request_logs. Relasi antar tabel bersifat one-to-many, seperti satu user dapat memiliki banyak api_key, dan satu destinasi dapat memiliki banyak review.'),
        imageParagraph('/home/claude/wisata-api/docs/erd.png', 590, 380),
        caption('Gambar 1. Entity Relationship Diagram - Wisata Indonesia API'),

        h2('3.1 Penjelasan Tabel'),
        simpleTable(
          ['Tabel', 'Fungsi'],
          [
            ['users', 'Menyimpan akun developer/pengguna yang login dengan JWT'],
            ['api_keys', 'Menyimpan API key yang dibuat tiap user untuk mengakses data'],
            ['destinations', 'Data inti (50+ destinasi wisata) yang disediakan melalui API'],
            ['reviews', 'Ulasan pengunjung terhadap suatu destinasi (relasi many-to-one)'],
            ['api_request_logs', 'Log setiap request yang masuk lewat suatu API key'],
          ],
          [2600, 6300]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        h1('4. Use Case Diagram'),
        p('Terdapat 4 aktor pada sistem ini: Pengunjung (Guest) yang belum memiliki akun, Developer (User Terdaftar) yang mengelola API key, Aplikasi Klien (API Consumer) yang mengonsumsi data menggunakan API key, dan Admin yang mengelola data destinasi.'),
        imageParagraph('/home/claude/wisata-api/docs/usecase.png', 560, 420),
        caption('Gambar 2. Use Case Diagram - Wisata Indonesia API'),

        new Paragraph({ children: [new PageBreak()] }),

        h1('5. Activity Diagram / Userflow'),
        p('Diagram berikut menggambarkan dua alur utama pada sistem: (kiri) alur registrasi akun hingga pembuatan API key, dan (kanan) alur konsumsi data API menggunakan API key oleh aplikasi klien.'),
        imageParagraph('/home/claude/wisata-api/docs/activity.png', 480, 660),
        caption('Gambar 3. Activity Diagram / Userflow - Wisata Indonesia API'),

        new Paragraph({ children: [new PageBreak()] }),

        h1('6. Dokumentasi Endpoint API'),
        h2('6.1 Autentikasi (JWT)'),
        simpleTable(
          ['Method', 'Endpoint', 'Deskripsi', 'Proteksi'],
          [
            ['POST', '/api/auth/register', 'Mendaftarkan akun baru', 'Publik'],
            ['POST', '/api/auth/login', 'Login, mengembalikan JWT token', 'Publik'],
          ],
          [1300, 3000, 3300, 1300]
        ),

        h2('6.2 Manajemen API Key (JWT Protected)'),
        simpleTable(
          ['Method', 'Endpoint', 'Deskripsi', 'Proteksi'],
          [
            ['POST', '/api/keys', 'Membuat API key baru', 'JWT'],
            ['GET', '/api/keys', 'Melihat daftar API key milik user', 'JWT'],
            ['PATCH', '/api/keys/:id/revoke', 'Menonaktifkan API key', 'JWT'],
            ['DELETE', '/api/keys/:id', 'Menghapus API key', 'JWT'],
          ],
          [1300, 3000, 3300, 1300]
        ),

        h2('6.3 Data Wisata (API Key Protected)'),
        simpleTable(
          ['Method', 'Endpoint', 'Deskripsi', 'Proteksi'],
          [
            ['GET', '/api/v1/destinations', 'List destinasi (filter, sort, pagination)', 'API Key'],
            ['GET', '/api/v1/destinations/:idOrSlug', 'Detail destinasi + review', 'API Key'],
            ['POST', '/api/v1/destinations/:id/reviews', 'Menambahkan review', 'API Key'],
            ['GET', '/api/v1/categories', 'Daftar kategori wisata', 'API Key'],
            ['GET', '/api/v1/provinces', 'Daftar provinsi', 'API Key'],
          ],
          [1300, 3400, 3200, 1000]
        ),

        h2('6.4 Contoh Request'),
        p('Login:', { bold: true }),
        new Paragraph({
          children: [new TextRun({ text: 'curl -X POST https://<domain>/api/auth/login -H "Content-Type: application/json" -d \'{"email":"user@mail.com","password":"rahasia123"}\'', font: 'Consolas', size: 18 })],
          spacing: { after: 200 },
        }),
        p('Mengambil data destinasi:', { bold: true }),
        new Paragraph({
          children: [new TextRun({ text: 'curl https://<domain>/api/v1/destinations?category=Pantai&limit=5 -H "x-api-key: wid_xxxxxxxx"', font: 'Consolas', size: 18 })],
          spacing: { after: 200 },
        }),

        new Paragraph({ children: [new PageBreak()] }),

        h1('7. Kesimpulan'),
        p('Wisata Indonesia API berhasil dirancang sebagai layanan SaaS dengan dua lapis autentikasi (JWT untuk akun, API Key untuk konsumsi data), 5 tabel basis data relasional, dan 50 data destinasi wisata sebagai data awal. Sistem telah didokumentasikan melalui ERD, Use Case Diagram, dan Activity Diagram, serta siap untuk di-deploy pada platform Vercel dengan database Supabase PostgreSQL.'),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('/home/claude/wisata-api/docs/Laporan_Wisata_Indonesia_API.docx', buffer);
  console.log('Laporan berhasil dibuat.');
});
