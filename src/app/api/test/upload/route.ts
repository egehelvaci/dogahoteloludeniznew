import { NextRequest, NextResponse } from 'next/server';
import { uploadToTebi } from '../../../../lib/tebi';

export const dynamic = 'force-dynamic';

// Maksimum dosya boyutu (görseller için 30MB, videolar için 100MB)
const MAX_IMAGE_SIZE = 30 * 1024 * 1024; // 30MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  try {
    console.log('Test API: Dosya alınıyor...');
    
    // Form verisini al
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'test';
    
    // Dosya kontrolü
    if (!file) {
      console.error('Test API: Dosya bulunamadı');
      return NextResponse.json(
        { success: false, message: 'Dosya yüklenemedi' },
        { status: 400 }
      );
    }
    
    console.log(`Test API: Dosya bilgileri - İsim: ${file.name}, Boyut: ${file.size}, Tür: ${file.type}`);
    
    // Dosya tipini kontrol et
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    
    // Dosya boyutu kontrolü
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      console.error(`Test API: Dosya boyutu çok büyük: ${file.size} bytes (max: ${maxSize} bytes)`);
      return NextResponse.json(
        { 
          success: false, 
          message: `Dosya boyutu çok büyük. ${isVideo ? 'Videolar için maksimum 100MB' : 'Görseller için maksimum 30MB'} desteklenir.` 
        },
        { status: 400 }
      );
    }
    
    // Dosyayı ArrayBuffer'a dönüştür
    const buffer = await file.arrayBuffer();
    const fileName = file.name.replace(/\s+/g, '-').toLowerCase();
    
    console.log(`Test API: ${fileName} yükleniyor...`);
    
    // Tebi.io yapılandırmasını kontrol et
    const apiKey = process.env.TEBI_API_KEY;
    const masterKey = process.env.TEBI_MASTER_KEY;
    const bucket = process.env.TEBI_BUCKET;
    
    // Detaylı yapılandırma bilgilerini logla (hata ayıklama için)
    console.log('Test API: Tebi.io yapılandırması (DETAYLI):', { 
      apiKey: apiKey ? apiKey.substring(0, 5) + '...' : 'tanımlanmamış',
      apiKeyLength: apiKey?.length,
      masterKey: masterKey ? masterKey.substring(0, 5) + '...' : 'tanımlanmamış',
      masterKeyLength: masterKey?.length,
      bucket: bucket || 'tanımlanmamış',
    });
    
    // Ortam değişkenleri ayarlı değilse hata ver
    if (!apiKey || !masterKey || !bucket) {
      console.error('Test API: Tebi.io yapılandırması eksik');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Dosya yükleme servisi yapılandırması eksik',
          error: 'CONFIGURATION_MISSING'
        },
        { status: 500 }
      );
    }
    
    console.log('Test API: Etkin yapılandırma:', {
      apiKey: apiKey.substring(0, 5) + '...',
      masterKey: masterKey.substring(0, 5) + '...',  
      bucket
    });
    
    try {
      // Tebi.io'ya yükle
      console.log('Test API: Tebi.io yükleme işlemi başlatılıyor...');
      
      // File nesnesini oluşturmadan önce detaylı log
      console.log('Test API: Dosya bilgileri (yükleme öncesi):', {
        fileName,
        fileType: file.type,
        fileSize: file.size,
        bufferSize: buffer.byteLength
      });

      const fileObj = new File([Buffer.from(buffer)], fileName, { type: file.type });
      console.log('Test API: File nesnesi oluşturuldu:', {
        name: fileObj.name,
        type: fileObj.type,
        size: fileObj.size
      });
      
      const result = await uploadToTebi({
        file: fileObj,
        path: folder
      });
      
      // Yanıtın tüm detaylarını inceleme
      console.log('Test API: uploadToTebi yanıtı (ham):', JSON.stringify(result));
      
      // URL kontrolü
      if (!result.fileUrl) {
        console.error('Test API: URL eksik!');
        return NextResponse.json(
          {
            success: false,
            message: 'Dosya yüklendi ancak URL bilgisi alınamadı',
            debug: result,
            error: 'URL_MISSING'
          },
          { status: 500 }
        );
      }
      
      console.log('Test API: Yükleme başarılı!', {
        url: result.fileUrl
      });
      
      // Başarılı yanıt döndür
      return NextResponse.json({
        success: true,
        message: 'Dosya başarıyla yüklendi',
        url: result.fileUrl
      });
    } catch (uploadError) {
      console.error('Test API: Tebi.io yükleme hatası:', uploadError);
      
      let errorMessage = 'Dosya yüklenirken bir hata oluştu';
      
      if (uploadError instanceof Error) {
        errorMessage = `Dosya yüklenirken bir hata oluştu: ${uploadError.message}`;
        console.error('Test API: Hata detayları:', {
          name: uploadError.name,
          message: uploadError.message,
          stack: uploadError.stack
        });
      } else if (typeof uploadError === 'object' && uploadError !== null) {
        // Obje tipindeki hatalar
        console.error('Test API: Hata obje içeriği:', JSON.stringify(uploadError));
        if ('error' in uploadError) {
          errorMessage = `Dosya yüklenirken bir hata oluştu: ${uploadError.error}`;
        }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage,
          error: 'UPLOAD_FAILED',
          debug: typeof uploadError === 'object' ? uploadError : { message: String(uploadError) }
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test API: Genel hata:', error);
    
    let errorMessage = 'Dosya yüklenirken bilinmeyen bir hata oluştu';
    let errorDetails = {};
    
    // Hata detaylarını kaydet
    if (error instanceof Error) {
      errorMessage = `Dosya yüklenirken bir hata oluştu: ${error.message}`;
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      };
      console.error('Test API: Detaylı hata bilgisi:', errorDetails);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: 'GENERAL_ERROR',
        debug: errorDetails
      },
      { status: 500 }
    );
  }
} 