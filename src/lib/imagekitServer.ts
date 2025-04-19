// SADECE SERVER-SIDE'DA KULLANILACAK FONKSİYONLAR
// Bu dosya client tarafında import edilmemelidir!

import ImageKit from 'imagekit';

export const getImageKitInstance = () => {
  if (typeof window !== 'undefined') {
    console.warn('ImageKit instance should not be created on the client side');
    return null;
  }

  // Geliştirme ortamı için varsayılan değerler (production'da kullanmayın!)
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'test_public_key';
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || 'test_private_key';
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/demo';

  // Gerçek ortamda çevre değişkenlerinin varlığını kontrol et
  if (process.env.NODE_ENV === 'production' && (!publicKey || !privateKey || !urlEndpoint)) {
    throw new Error('ImageKit yapılandırma değerleri eksik');
  }

  console.log('ImageKit instance oluşturuluyor:', { 
    publicKey, 
    urlEndpoint, 
    privateKeyExists: !!privateKey 
  });

  return new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
};

// Dosyayı ImageKit'e yükleme (sadece sunucu tarafında kullanılabilir)
export const uploadToImageKit = async (
  file: Buffer,
  fileName: string,
  folder: string = 'uploads'
) => {
  try {
    const imagekit = getImageKitInstance();
    if (!imagekit) {
      throw new Error('ImageKit instance oluşturulamadı');
    }

    console.log(`ImageKit'e dosya yükleniyor: ${fileName} (${folder} klasörüne)`);
    
    const result = await imagekit.upload({
      file,
      fileName,
      folder,
    });

    console.log('ImageKit yükleme başarılı:', { fileName, fileId: result.fileId });

    // Dosya türünü belirle
    const fileType = result.fileType?.startsWith('image') ? 'image' : 'video';

    return {
      success: true,
      data: result,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      fileId: result.fileId,
      fileType: fileType
    };
  } catch (error) {
    console.error('ImageKit yükleme hatası:', error);
    return {
      success: false,
      error: `Dosya yüklenemedi: ${(error as Error).message}`,
    };
  }
};

// Dosyayı ImageKit'ten silme (sadece sunucu tarafında kullanılabilir)
export const deleteFromImageKit = async (fileId: string) => {
  try {
    const imagekit = getImageKitInstance();
    if (!imagekit) {
      throw new Error('ImageKit instance oluşturulamadı');
    }

    console.log(`ImageKit'ten dosya siliniyor: ${fileId}`);
    
    await imagekit.deleteFile(fileId);
    
    console.log('ImageKit silme başarılı:', { fileId });
    
    return { success: true };
  } catch (error) {
    console.error('ImageKit silme hatası:', error);
    return {
      success: false,
      error: `Dosya silinemedi: ${(error as Error).message}`,
    };
  }
}; 