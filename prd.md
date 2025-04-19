# Doğa Hotel Web Sitesi - Vercel Uyumlu Hale Getirme PRD

---

## 📌 Proje Amacı
Proje, Next.js + React ile geliştirilmiş bir otel web sitesidir. Mevcut yapıda veri işlemleri JSON dosyaları üzerinden yapılmakta ve medya dosyaları proje klasörüne yüklenmektedir. Ancak bu yapı, Vercel'in çalışma şekline uygun değildir. Bu PRD, projenin Vercel'e uyarlanması için yapılması gereken tüm adımları, yapılacaklar ve yapılanlar şeklinde ayrıntılı şekilde sunar.

---

## ✅ Yapılanlar

- [x] Proje Next.js + React olarak tamamlandı.
- [x] Admin panel üzerinden içerik güncelleme çalışıyor.
- [x] Veriler `.json` dosyalarına yazılıyor, görseller `public/uploads` klasörüne yükleniyor.
- [x] Proje localde sorunsuz çalışıyor.
- [x] GitHub repository oluşturuldu.
- [x] İlk push işlemi sırasında büyük dosya hatası alındı (100 MB sınırı).
- [x] Vercel ile deploy denendi ancak yazma işlemleri yüzünden hata alındı.

---

## 🛠️ Yapılacaklar

### 1. JSON ve Dosya Sisteminden Kurtulma
- [x] `fs.writeFile`, `fs.readFile` gibi kodlar tamamen kaldırılacak.
- [x] JSON yerine PostgreSQL veritabanı kullanılacak.

### 2. Veritabanı Kurulumu (Supabase/Neon)
- [x] Neon üzerinden PostgreSQL kurulumu yapılacak.
- [x] Gerekli tablo şemaları oluşturulacak.
- [x] `postgresql://neondb_owner:npg_Z9MCcdwu3YGb@ep-icy-bird-a2ty8aid-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require` Vercel'e eklenecek.

### 3. Medya Yüklemeleri İçin Cloudinary Entegrasyonu
- [x] Cloudinary hesabı açılacak.
- [x] Upload preset oluşturulacak.
- [x] `cloudinary`, `multer`, `multer-storage-cloudinary` paketleri yüklenecek.
- [x] `/api/upload.js` API route'u hazırlanacak.
- [x] `public/uploads` klasörü git geçmişinden silinecek.

### 4. API Güncellemeleri
- [x] Mevcut tüm API'ler PostgreSQL'e veri yazacak şekilde yeniden yazılacak.
- [x] Medya dosyalarının URL'leri veritabanında tutulacak.

### 5. Ortam Değişkenlerinin Tanımlanması
- [x] Vercel ortam değişkenleri:
  - `postgresql://neondb_owner:npg_Z9MCcdwu3YGb@ep-icy-bird-a2ty8aid-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require`
  - `djfcvgige`
  - `985527211114818`
  - `2C1vsAFcPj7tHPoAc0Jy_75ZPB0`
  - `dogahotelupload`

### 6. Frontend Güncellemeleri
- [x] Görsel yükleme alanları Cloudinary'ye entegre edilecek.
- [x] Görsel yüklendikten sonra URL veritabanına yazılacak.
- [x] Tüm veri okuma işlemleri artık PostgreSQL'den yapılacak.

### 7. Vercel Yayınlama
- [x] Proje temizlenip GitHub'a tekrar push edilecek.
- [ ] Vercel üzerinden deploy işlemi yapılacak.
- [ ] Test işlemleri yapılacak (veri çekme, görsel gösterme vs).

---

## 🎯 Kabul Kriterleri
- [x] JSON dosyası kullanılmıyor.
- [x] `public/uploads` klasörüne dosya yazımı yapılmıyor.
- [x] Tüm medya Cloudinary üzerinden yükleniyor ve gösteriliyor.
- [ ] Vercel üzerinde başarıyla çalışan bir site var.
- [ ] Admin panel üzerinden içerik güncellenebiliyor.
- [ ] Otomatik olarak tüm değişiklikler yayınlanabiliyor.

---

## 🔗 Kaynaklar
- [Supabase](https://supabase.com)
- [NeonDB](https://neon.tech)
- [Cloudinary](https://cloudinary.com)
- [Vercel](https://vercel.com)

