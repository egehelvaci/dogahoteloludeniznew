-- CreateTable
CREATE TABLE "about" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_sections" (
    "id" TEXT NOT NULL,
    "title_tr" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "subtitle_tr" TEXT,
    "subtitle_en" TEXT,
    "content_tr" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "image_url" TEXT,
    "video_url" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "show_on_home" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slider" (
    "id" TEXT NOT NULL,
    "title_tr" TEXT,
    "title_en" TEXT,
    "subtitle_tr" TEXT,
    "subtitle_en" TEXT,
    "description_tr" TEXT,
    "description_en" TEXT,
    "image_url" TEXT NOT NULL,
    "video_url" TEXT,
    "order_number" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery" (
    "id" TEXT NOT NULL,
    "title_tr" TEXT,
    "title_en" TEXT,
    "description_tr" TEXT,
    "description_en" TEXT,
    "image_url" TEXT NOT NULL,
    "video_url" TEXT,
    "order_number" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'image',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "title_tr" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "description_tr" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "details_tr" TEXT[],
    "details_en" TEXT[],
    "image_url" TEXT,
    "icon" TEXT,
    "order_number" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_gallery" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "order_number" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "name_tr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_tr" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "features_tr" TEXT[],
    "features_en" TEXT[],
    "price_tr" TEXT NOT NULL,
    "price_en" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 2,
    "size" INTEGER NOT NULL DEFAULT 25,
    "main_image_url" TEXT,
    "type" TEXT NOT NULL DEFAULT 'standard',
    "room_type_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order_number" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_gallery" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "order_number" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_types" (
    "id" TEXT NOT NULL,
    "name_tr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_gallery" ADD CONSTRAINT "service_gallery_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_gallery" ADD CONSTRAINT "room_gallery_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
