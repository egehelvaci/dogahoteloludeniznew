import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Tüm slider öğelerini getir
export async function GET() {
  try {
    console.log('Tüm slider öğeleri için GET isteği alındı');
    
    const sliders = await prisma.slider.findMany({
      orderBy: {
        orderNumber: 'asc'
      }
    });
    
    console.log('Toplam slider öğesi:', sliders.length);
    
    // Örnek bir slider kaydının detaylarını logla
    if (sliders.length > 0) {
      console.log('Örnek slider kaydı (veritabanı):', {
        id: sliders[0].id,
        imageUrl: sliders[0].imageUrl,
        videoUrl: sliders[0].videoUrl,
        titleTR: sliders[0].titleTR
      });
    }
    
    // Veritabanından gelen verileri istemci tarafında kullanılabilir formata dönüştür
    const formattedSliders = sliders.map(slider => ({
      id: slider.id,
      image: slider.imageUrl,
      videoUrl: slider.videoUrl,
      titleTR: slider.titleTR,
      titleEN: slider.titleEN,
      subtitleTR: slider.subtitleTR || '',
      subtitleEN: slider.subtitleEN || '',
      descriptionTR: slider.descriptionTR || '',
      descriptionEN: slider.descriptionEN || '',
      order: slider.orderNumber,
      active: slider.active
    }));
    
    // Dönüştürülmüş yanıtın detaylarını logla
    if (formattedSliders.length > 0) {
      console.log('Örnek slider kaydı (dönüştürülmüş):', {
        id: formattedSliders[0].id,
        image: formattedSliders[0].image,
        order: formattedSliders[0].order
      });
    }
    
    return NextResponse.json(formattedSliders, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Slider verileri alınırken bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Slider verileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni slider öğesi ekle
export async function POST(request) {
  try {
    console.log('Yeni slider öğesi için POST isteği alındı');
    const body = await request.json();
    console.log('Gönderilen veri:', body);
    
    // Gerekli alanları kontrol et
    if ((!body.image && !body.videoUrl) || !body.titleTR || !body.titleEN) {
      console.error('Eksik alanlar:', { 
        mediaCheck: !(body.image || body.videoUrl), 
        titleTR: !body.titleTR, 
        titleEN: !body.titleEN 
      });
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik: En az bir görsel veya video ve başlıklar gereklidir' },
        { status: 400 }
      );
    }
    
    // Sıra numarasını belirle
    const lastSlider = await prisma.slider.findFirst({
      orderBy: {
        orderNumber: 'desc'
      }
    });
    
    const orderNumber = lastSlider ? lastSlider.orderNumber + 1 : 1;
    
    // Yeni slider öğesini ekle
    const newSlider = await prisma.slider.create({
      data: {
        id: body.id || uuidv4(),
        titleTR: body.titleTR,
        titleEN: body.titleEN,
        subtitleTR: body.subtitleTR || '',
        subtitleEN: body.subtitleEN || '',
        descriptionTR: body.descriptionTR || '',
        descriptionEN: body.descriptionEN || '',
        imageUrl: body.image || '',
        videoUrl: body.videoUrl || '',
        orderNumber: body.order || orderNumber,
        active: body.active !== undefined ? body.active : true
      }
    });
    
    // Yanıtı istemci formatına dönüştür
    const formattedSlider = {
      id: newSlider.id,
      image: newSlider.imageUrl,
      videoUrl: newSlider.videoUrl,
      titleTR: newSlider.titleTR,
      titleEN: newSlider.titleEN,
      subtitleTR: newSlider.subtitleTR || '',
      subtitleEN: newSlider.subtitleEN || '',
      descriptionTR: newSlider.descriptionTR || '',
      descriptionEN: newSlider.descriptionEN || '',
      order: newSlider.orderNumber,
      active: newSlider.active
    };
    
    console.log('Slider öğesi eklendi:', formattedSlider);
    return NextResponse.json(formattedSlider, { status: 201 });
  } catch (error) {
    console.error('Slider verisi eklenirken bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Slider verisi eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Slider öğesini güncelle
export async function PUT(request) {
  try {
    // Body ve URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const urlId = searchParams.get('id');
    const body = await request.json();
    
    console.log('Slider güncelleme isteği:', {
      urlId,
      bodyId: body.id,
      body: JSON.stringify(body)
    });
    
    // ID kontrolü - önce URL parametresinden, yoksa body'den al
    const id = urlId || body.id;
    
    if (!id) {
      console.error('Güncellenecek slider ID\'si bulunamadı (URL veya body)');
      return NextResponse.json(
        { 
          success: false,
          error: "Güncellenecek slider öğesinin ID'si gereklidir",
          details: "ID değeri URL parametresi (?id=...) veya istek gövdesinde (body.id) belirtilmelidir"
        },
        { status: 400 }
      );
    }
    
    console.log(`Slider güncelleniyor, ID: ${id}, veri:`, body);
    
    // Slider öğesinin var olup olmadığını kontrol et
    const existingSlider = await prisma.slider.findUnique({
      where: { id }
    });
    
    if (!existingSlider) {
      console.error(`Güncellenecek slider bulunamadı, ID: ${id}`);
      return NextResponse.json(
        { 
          success: false,
          error: 'Güncellenecek slider öğesi bulunamadı',
          details: `ID: ${id} ile eşleşen slider kaydı bulunamadı`
        },
        { status: 404 }
      );
    }
    
    // Güncellenecek alanları belirle
    const updateData = {};
    
    if (body.titleTR !== undefined) updateData.titleTR = body.titleTR;
    if (body.titleEN !== undefined) updateData.titleEN = body.titleEN;
    if (body.subtitleTR !== undefined) updateData.subtitleTR = body.subtitleTR;
    if (body.subtitleEN !== undefined) updateData.subtitleEN = body.subtitleEN;
    if (body.descriptionTR !== undefined) updateData.descriptionTR = body.descriptionTR;
    if (body.descriptionEN !== undefined) updateData.descriptionEN = body.descriptionEN;
    if (body.image !== undefined) updateData.imageUrl = body.image;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.order !== undefined) updateData.orderNumber = body.order;
    if (body.active !== undefined) updateData.active = body.active;
    
    console.log('Güncellenecek alanlar:', updateData);
    
    // Hiçbir alan güncellenmeyecekse mevcut veriyi döndür
    if (Object.keys(updateData).length === 0) {
      console.log('Güncellenecek alan yok, mevcut veri döndürülüyor');
      
      // Mevcut veriyi istemci formatına dönüştür
      const formattedSlider = {
        id: existingSlider.id,
        image: existingSlider.imageUrl,
        videoUrl: existingSlider.videoUrl,
        titleTR: existingSlider.titleTR,
        titleEN: existingSlider.titleEN,
        subtitleTR: existingSlider.subtitleTR || '',
        subtitleEN: existingSlider.subtitleEN || '',
        descriptionTR: existingSlider.descriptionTR || '',
        descriptionEN: existingSlider.descriptionEN || '',
        order: existingSlider.orderNumber,
        active: existingSlider.active
      };
      
      return NextResponse.json({
        success: true,
        data: formattedSlider
      }, { status: 200 });
    }
    
    // Güncellemeyi yap
    const updatedSlider = await prisma.slider.update({
      where: { id },
      data: updateData
    });
    
    // Yanıtı istemci formatına dönüştür
    const formattedSlider = {
      id: updatedSlider.id,
      image: updatedSlider.imageUrl,
      videoUrl: updatedSlider.videoUrl,
      titleTR: updatedSlider.titleTR,
      titleEN: updatedSlider.titleEN,
      subtitleTR: updatedSlider.subtitleTR || '',
      subtitleEN: updatedSlider.subtitleEN || '',
      descriptionTR: updatedSlider.descriptionTR || '',
      descriptionEN: updatedSlider.descriptionEN || '',
      order: updatedSlider.orderNumber,
      active: updatedSlider.active
    };
    
    console.log('Slider başarıyla güncellendi:', formattedSlider);
    
    return NextResponse.json({
      success: true,
      data: formattedSlider
    }, { status: 200 });
  } catch (error) {
    console.error('Slider verisi güncellenirken hata:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Slider verisi güncellenirken bir hata oluştu',
        message: error.message || 'Bilinmeyen hata',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Slider öğesini sil
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Silinecek slider öğesinin ID'si gereklidir" },
        { status: 400 }
      );
    }
    
    // Transaction başlat
    return await prisma.$transaction(async (tx) => {
      // Slider öğesini kontrol et
      const existingSlider = await tx.slider.findUnique({
        where: { id }
      });
      
      if (!existingSlider) {
        return NextResponse.json(
          { error: 'Silinecek slider öğesi bulunamadı' },
          { status: 404 }
        );
      }
      
      // Slider öğesini sil
      await tx.slider.delete({
        where: { id }
      });
      
      // Tüm slider öğelerini sıralı şekilde al
      const remainingSliders = await tx.slider.findMany({
        orderBy: { orderNumber: 'asc' }
      });
      
      // Sıra numaralarını güncelle
      for (let i = 0; i < remainingSliders.length; i++) {
        await tx.slider.update({
          where: { id: remainingSliders[i].id },
          data: { orderNumber: i + 1 }
        });
      }
      
      return NextResponse.json(
        { message: 'Slider öğesi başarıyla silindi' },
        { status: 200 }
      );
    });
  } catch (error) {
    console.error('Slider verisi silinirken hata:', error);
    return NextResponse.json(
      { error: 'Slider verisi silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 