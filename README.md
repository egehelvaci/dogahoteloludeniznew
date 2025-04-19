# Doğa Hotel Ölüdeniz

Ölüdeniz'de bulunan Doğa Hotel'in resmi web sitesi.

## Teknolojiler

- Next.js 15
- TypeScript
- Tailwind CSS
- PostgreSQL (Neon.tech)
- Tebi.io (S3 uyumlu depolama)

## Deployment

### Vercel Deploy Adımları

1. Projeyi GitHub'a push edin
2. Vercel'de yeni bir proje oluşturun ve GitHub reponuzu seçin
3. Aşağıdaki ortam değişkenlerini Vercel üzerinde tanımlayın:

```
DATABASE_URL=postgresql://neondb_owner:npg_Z9MCcdwu3YGb@ep-icy-bird-a2ty8aid-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
TEBI_BUCKET=dogahotelfethiye
TEBI_API_KEY=alznfugnmS1jyhnS
TEBI_MASTER_KEY=mcjtH1bhF2mnIke7VB2MVuQnk5YaJdbTCisd7xhk
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_pN6cJbvfbzQHZXcDYBNQGZa10JM=
```

4. Build ayarları:
   - Build Command: `npm install --legacy-peer-deps && next build`
   - Install Command: `npm install --legacy-peer-deps`

5. Deploy işlemini başlatın

## Geliştirme

Projeyi yerel ortamda çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Derleme işlemi
npm run build

# Üretim sunucusunu başlatın
npm run start
```

## Notlar

- TypeScript ve ESLint hataları derleme sırasında göz ardı edilir (next.config.js içinde yapılandırıldı)
- Vercel üzerinde otomatik olarak CI/CD pipeline'ı oluşturulacaktır
