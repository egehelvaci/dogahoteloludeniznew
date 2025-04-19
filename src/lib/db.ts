import { Pool } from 'pg';

// PostgreSQL bağlantı havuzu oluştur
let pool: Pool | undefined;

// Eğer havuz yoksa oluştur
function getPool(): Pool {
  if (!pool) {
    console.log('Veritabanı havuzu oluşturuluyor');
    
    // Bağlantı URL'sini log'a yazalım (hassas bilgiler gizlenerek)
    const databaseUrl = process.env.DATABASE_URL || '';
    console.log('DB URL:', databaseUrl ? 'Mevcut ✓' : 'Eksik ✗');
    console.log('DB URL prefix:', databaseUrl.substring(0, 15) + '...');
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    
    // Havuzu test et
    pool.on('error', (err) => {
      console.error('PostgreSQL havuzu hatası:', err);
      pool = undefined; // Havuzu sıfırla
    });
    
    pool.on('connect', () => {
      console.log('PostgreSQL bağlantısı kuruldu');
    });
  }
  
  return pool;
}

// SQL sorgusu çalıştırma
export async function executeQuery(text: string, params?: any[]): Promise<any> {
  const startTime = Date.now();
  try {
    // Pool'un mevcut olduğundan emin ol
    if (!pool) {
      console.log('Veritabanı havuzu oluşturuluyor');
      
      if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL çevre değişkeni tanımlı değil!');
        throw new Error('Veritabanı bağlantı bilgileri eksik! process.env.DATABASE_URL tanımlı değil');
      }
      
      // Bağlantı URL'sini güvenli bir şekilde logla
      const dbUrlMasked = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
      console.log(`DB URL: ${dbUrlMasked.substring(0, 25)}...`);
      
      // Havuzu oluştur
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20, // Maksimum bağlantı sayısı
        idleTimeoutMillis: 30000, // Boşta kalma süresi - 30 saniye
        connectionTimeoutMillis: 10000, // Bağlantı zaman aşımı - 10 saniye
      });
      
      // Hata dinleyicisi ekle
      pool.on('error', (err) => {
        console.error('PostgreSQL havuzu hatası:', err);
      });
      
      // Bağlantı testi yap
      try {
        const testClient = await pool.connect();
        console.log('PostgreSQL bağlantısı başarıyla kuruldu');
        testClient.release();
      } catch (connErr: any) {
        console.error('PostgreSQL bağlantı testi başarısız oldu:', connErr);
        throw new Error(`Veritabanı bağlantı hatası: ${connErr.message}`);
      }
    }
    
    // Debug amaçlı sorguyu ve parametreleri yazdır (hassas verileri gizleyerek)
    console.log('SQL sorgusu çalıştırılıyor:', text.replace(/\s+/g, ' ').trim());
    
    if (params && params.length > 0) {
      // Parametreleri güvenli şekilde logla (çok uzun değerleri kısalt)
      const safeParams = params.map(p => {
        if (p === null) return 'NULL';
        if (typeof p === 'string' && p.length > 50) return p.substring(0, 47) + '...';
        return p;
      });
      console.log('Parametreler:', safeParams);
    } else {
      console.log('Parametreler: Yok');
    }
    
    // BEGIN, COMMIT, ROLLBACK gibi transaction komutları için özel işlem
    if (/^(BEGIN|COMMIT|ROLLBACK)$/i.test(text.trim())) {
      console.log(`Transaction komutu işleniyor: ${text}`);
      
      try {
        // Client bağlantısı al
        const client = await pool.connect();
        console.log('Transaction için client alındı');
        
        try {
          // Transaction komutunu çalıştır
          await client.query(text);
          console.log(`Transaction komutu başarıyla çalıştırıldı: ${text}`);
          
          // BEGIN için client nesnesini döndür, diğerleri için boş yanıt
          if (/^BEGIN$/i.test(text.trim())) {
            return { rows: [], rowCount: 0, client };
          } else {
            // COMMIT ve ROLLBACK sonrası client'ı serbest bırak
            client.release();
            return { rows: [], rowCount: 0 };
          }
        } catch (txError: any) {
          console.error(`Transaction komutu hatası (${text}):`, txError);
          // Hata durumunda client'ı serbest bırak
          client.release();
          throw new Error(`Transaction komutu hatası: ${txError.message}`);
        }
      } catch (clientError: any) {
        console.error('Transaction client alınırken hata:', clientError);
        throw new Error(`Transaction client hatası: ${clientError.message}`);
      }
    }
    
    // Normal sorgu çalıştırma
    const res = await pool.query(text, params);
    const duration = Date.now() - startTime;
    
    // Sonuçları logla
    console.log(`Sorgu tamamlandı (${duration}ms), ${res.rowCount || 0} satır etkilendi/döndürüldü`);
    
    if (res.rows && res.rows.length > 0 && res.rows.length <= 5) {
      console.log('İlk sonuç örneği:', JSON.stringify(res.rows[0]).substring(0, 200));
    }
    
    return res;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`SQL sorgusu hatası (${duration}ms):`, error);
    
    // Daha açıklayıcı hata mesajı oluştur
    let detailedError: Error = error;
    
    if (error.code) {
      // PostgreSQL hata kodlarına göre özel mesajlar
      switch (error.code) {
        case '23505': // unique_violation
          detailedError = new Error(`Benzersizlik hatası: Bu kayıt zaten mevcut. ${error.detail || ''}`);
          break;
        case '23503': // foreign_key_violation
          detailedError = new Error(`Yabancı anahtar hatası: İlişkili kayıt bulunamadı. ${error.detail || ''}`);
          break;
        case '23502': // not_null_violation
          detailedError = new Error(`NULL değer hatası: Zorunlu alan boş bırakılamaz. ${error.column || ''}`);
          break;
        case '42P01': // undefined_table
          detailedError = new Error(`Tablo bulunamadı: ${error.message}`);
          break;
        case '42703': // undefined_column
          detailedError = new Error(`Sütun bulunamadı: ${error.message}`);
          break;
        case '08006': // connection_failure
        case '08001': // sqlclient_unable_to_establish_sqlconnection
          detailedError = new Error(`Veritabanı bağlantı hatası: ${error.message}`);
          break;
        case '55P03': // lock_not_available
          detailedError = new Error(`Kilit hatası: Kaynak şu anda başka bir işlem tarafından kilitlenmiş. Lütfen daha sonra tekrar deneyin.`);
          break;
        case '57014': // query_canceled
          detailedError = new Error(`Sorgu iptal edildi: İşlem zaman aşımına uğradı.`);
          break;
        case '25P02': // in_failed_sql_transaction
          detailedError = new Error(`Transaction hatası: Önceki bir hata nedeniyle bu transaction artık çalışmıyor. ROLLBACK gerekiyor.`);
          break;
        default:
          detailedError = new Error(`Veritabanı hatası (${error.code}): ${error.message}`);
      }
    }
    
    console.error('Detaylı hata:', detailedError.message);
    throw detailedError;
  }
}

// Bağlantıyı kapat (server shutdown sırasında çağrılabilir)
export async function closePool() {
  if (pool) {
    console.log('Veritabanı havuzu kapatılıyor');
    await pool.end();
    pool = undefined;
  }
} 