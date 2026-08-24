-- =========================================================
-- SKEMA DATABASE: WISATA INDONESIA API
-- =========================================================

-- 1. Tabel users (untuk autentikasi JWT / pemilik akun)
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  UNIQUE NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    role          VARCHAR(20)   NOT NULL DEFAULT 'user', -- user | admin
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 2. Tabel api_keys (setiap user bisa punya banyak API key)
CREATE TABLE IF NOT EXISTS api_keys (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_key        VARCHAR(64) UNIQUE NOT NULL,
    label          VARCHAR(100) NOT NULL DEFAULT 'default key',
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    request_count  INTEGER NOT NULL DEFAULT 0,
    rate_limit     INTEGER NOT NULL DEFAULT 100, -- request/menit
    last_used_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel destinations (data inti yang dijual/disediakan lewat API)
CREATE TABLE IF NOT EXISTS destinations (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    slug          VARCHAR(160) UNIQUE NOT NULL,
    category      VARCHAR(50)  NOT NULL,   -- Pantai, Gunung, Museum, Taman, Kuliner, Budaya, dst
    province      VARCHAR(100) NOT NULL,
    city          VARCHAR(100) NOT NULL,
    description   TEXT,
    price_ticket  INTEGER NOT NULL DEFAULT 0,
    rating        NUMERIC(2,1) NOT NULL DEFAULT 0.0,
    latitude      NUMERIC(9,6),
    longitude     NUMERIC(9,6),
    facilities    TEXT[],                   -- array: {"Parkir","Toilet","Musholla"}
    opening_hours VARCHAR(100),
    image_url     TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabel reviews (relasi many-to-one ke destinations)
CREATE TABLE IF NOT EXISTS reviews (
    id             SERIAL PRIMARY KEY,
    destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    reviewer_name  VARCHAR(100) NOT NULL,
    rating         SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment        TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabel api_request_logs (audit trail pemakaian API key)
CREATE TABLE IF NOT EXISTS api_request_logs (
    id           BIGSERIAL PRIMARY KEY,
    api_key_id   INTEGER REFERENCES api_keys(id) ON DELETE SET NULL,
    endpoint     VARCHAR(150) NOT NULL,
    method       VARCHAR(10)  NOT NULL,
    status_code  INTEGER,
    ip_address   VARCHAR(45),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_province ON destinations(province);
CREATE INDEX IF NOT EXISTS idx_reviews_destination_id ON reviews(destination_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_logs_api_key_id ON api_request_logs(api_key_id);
