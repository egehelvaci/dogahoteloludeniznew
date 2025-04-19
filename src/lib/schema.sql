-- Hakkımızda verileri için tablo
CREATE TABLE IF NOT EXISTS about (
  id SERIAL PRIMARY KEY,
  title_tr VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  content_tr TEXT NOT NULL,
  content_en TEXT NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Slider verileri için tablo
CREATE TABLE IF NOT EXISTS slider (
  id SERIAL PRIMARY KEY,
  title_tr VARCHAR(255),
  title_en VARCHAR(255),
  description_tr TEXT,
  description_en TEXT,
  image_url VARCHAR(255) NOT NULL,
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Galeri verileri için tablo
CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  title_tr VARCHAR(255),
  title_en VARCHAR(255),
  description_tr TEXT,
  description_en TEXT,
  image_url VARCHAR(255) NOT NULL,
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hizmetler verileri için tablo
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  title_tr VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  description_tr TEXT NOT NULL,
  description_en TEXT NOT NULL,
  image_url VARCHAR(255),
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hizmet galeri görüntüleri için tablo
CREATE TABLE IF NOT EXISTS service_gallery (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Odalar verileri için tablo
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  title_tr VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  description_tr TEXT NOT NULL,
  description_en TEXT NOT NULL,
  features_tr TEXT[],
  features_en TEXT[],
  price DECIMAL(10, 2),
  main_image_url VARCHAR(255),
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Oda galeri görüntüleri için tablo
CREATE TABLE IF NOT EXISTS room_gallery (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 