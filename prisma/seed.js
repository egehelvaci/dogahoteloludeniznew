const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('Veritabanı seed işlemi başlatılıyor...');

  // Oda tiplerini ekleyelim
  const roomTypes = [
    {
      id: uuidv4(),
      nameTR: 'Standart Oda',
      nameEN: 'Standard Room',
      active: true
    },
    {
      id: uuidv4(),
      nameTR: 'Üç Kişilik Oda',
      nameEN: 'Triple Room',
      active: true
    },
    {
      id: uuidv4(),
      nameTR: 'Süit Oda',
      nameEN: 'Suite Room',
      active: true
    },
    {
      id: uuidv4(),
      nameTR: 'Apart Oda',
      nameEN: 'Apart Room',
      active: true
    }
  ];

  console.log('Oda tipleri ekleniyor...');
  
  const createdRoomTypes = await Promise.all(
    roomTypes.map(async (type) => {
      const roomType = await prisma.roomType.upsert({
        where: { id: type.id },
        update: {
          nameTR: type.nameTR,
          nameEN: type.nameEN,
          active: type.active
        },
        create: {
          id: type.id,
          nameTR: type.nameTR,
          nameEN: type.nameEN,
          active: type.active
        }
      });
      return roomType;
    })
  );

  console.log(`${createdRoomTypes.length} oda tipi eklendi veya güncellendi.`);

  // Odaları ekleyelim
  const rooms = [
    {
      id: uuidv4(),
      nameTR: 'Standart Oda',
      nameEN: 'Standard Room',
      descriptionTR: '26 m2 olup, çift kişilik yatak mevcuttur. Odalarda; Klima, Saç Kurutma Makinası, LCD TV, WC & Duşa Kabin, Balkon, Dağ yada Havuz Manzarası bulunmaktadır.',
      descriptionEN: '26 m2 with a double bed. Equipped with Air Conditioning, Hair Dryer, LCD TV, WC & Shower Cabin, Balcony, Mountain or Pool View.',
      featuresTR: ['Klima', 'Saç Kurutma Makinası', 'LCD TV', 'WC & Duşa Kabin', 'Balkon', 'Dağ yada Havuz Manzarası'],
      featuresEN: ['Air Conditioning', 'Hair Dryer', 'LCD TV', 'WC & Shower Cabin', 'Balcony', 'Mountain or Pool View'],
      priceTR: '₺1.500',
      priceEN: '€80',
      capacity: 2,
      size: 26,
      mainImageUrl: '/images/rooms/standart/standard-room.jpg',
      type: 'standard',
      roomTypeId: createdRoomTypes[0].id,
      active: true,
      orderNumber: 0
    },
    {
      id: uuidv4(),
      nameTR: 'Üç Kişilik Oda',
      nameEN: 'Triple Room',
      descriptionTR: '26 m2 olup, Odalarda 1 adet çift kişilik 1 adet tek kişilik yatak mevcuttur. Odalarda; Klima, Saç Kurutma Makinası, LCD TV, WC & Duşa Kabin, Balkon, Dağ yada Havuz Manzarası bulunmaktadır.',
      descriptionEN: '26 m2 with 1 double bed and 1 single bed. Features Air Conditioning, Hair Dryer, LCD TV, WC & Shower Cabin, Balcony, Mountain or Pool View.',
      featuresTR: ['Klima', 'Saç Kurutma Makinası', 'LCD TV', 'WC & Duşa Kabin', 'Balkon', 'Dağ yada Havuz Manzarası'],
      featuresEN: ['Air Conditioning', 'Hair Dryer', 'LCD TV', 'WC & Shower Cabin', 'Balcony', 'Mountain or Pool View'],
      priceTR: '₺2.500',
      priceEN: '€120',
      capacity: 3,
      size: 26,
      mainImageUrl: '/images/rooms/triple/triple-room.jpg',
      type: 'triple',
      roomTypeId: createdRoomTypes[1].id,
      active: true,
      orderNumber: 1
    },
    {
      id: uuidv4(),
      nameTR: 'Süit Oda',
      nameEN: 'Suite Room',
      descriptionTR: '40 m2 olup, 1 adet çift kişilik Yatak ve 3 adet tek kişilik yatak mevcuttur. Tek duşlu olup seramik zeminden oluşmaktadır. Odalarda; Klima, Saç Kurutma Makinası, LCD TV, Mini-Bar, WC & Duşa Kabin, Balkon, Güvenlik Kasası, Dağ yada Havuz Manzarası bulunmaktadır.',
      descriptionEN: '40 m2 with 1 double bed and 3 single beds. Features a single shower and ceramic floor. Includes Air Conditioning, Hair Dryer, LCD TV, Mini-Bar, WC & Shower Cabin, Balcony, Safety Deposit Box, Mountain or Pool View.',
      featuresTR: ['Klima', 'Saç Kurutma Makinası', 'LCD TV', 'Mini-Bar', 'WC & Duşa Kabin', 'Balkon', 'Güvenlik Kasası', 'Dağ yada Havuz Manzarası'],
      featuresEN: ['Air Conditioning', 'Hair Dryer', 'LCD TV', 'Mini-Bar', 'WC & Shower Cabin', 'Balcony', 'Safety Deposit Box', 'Mountain or Pool View'],
      priceTR: '₺3.500',
      priceEN: '€180',
      capacity: 5,
      size: 40,
      mainImageUrl: '/images/rooms/suite/suite-room.jpg',
      type: 'suite',
      roomTypeId: createdRoomTypes[2].id,
      active: true,
      orderNumber: 2
    },
    {
      id: uuidv4(),
      nameTR: 'Apart Oda',
      nameEN: 'Apart Room',
      descriptionTR: '30 m2 olup, tek duşlu olup seramik zeminden oluşmaktadır. Odalarda; Klima, Saç Kurutma Makinası, Uydu TV, WC & Duşa Kabin, Balkon, Dağ yada Havuz Manzarası bulunmaktadır.',
      descriptionEN: '30 m2 with a single shower and ceramic floor. Features Air Conditioning, Hair Dryer, Satellite TV, WC & Shower Cabin, Balcony, Mountain or Pool View.',
      featuresTR: ['Klima', 'Saç Kurutma Makinası', 'Uydu TV', 'WC & Duşa Kabin', 'Balkon', 'Dağ yada Havuz Manzarası'],
      featuresEN: ['Air Conditioning', 'Hair Dryer', 'Satellite TV', 'WC & Shower Cabin', 'Balcony', 'Mountain or Pool View'],
      priceTR: '₺2.000',
      priceEN: '€100',
      capacity: 2,
      size: 30,
      mainImageUrl: '/images/rooms/apart/apart-room.jpg',
      type: 'apart',
      roomTypeId: createdRoomTypes[3].id,
      active: true,
      orderNumber: 3
    }
  ];

  console.log('Odalar ekleniyor...');

  // Önce mevcut tüm odaları temizleyelim
  await prisma.roomGallery.deleteMany({});
  await prisma.room.deleteMany({});

  // Odaları ekleyelim
  for (const room of rooms) {
    console.log(`Oda ekleniyor: ${room.nameTR}`);
    
    const createdRoom = await prisma.room.create({
      data: {
        id: room.id,
        nameTR: room.nameTR,
        nameEN: room.nameEN,
        descriptionTR: room.descriptionTR,
        descriptionEN: room.descriptionEN,
        featuresTR: room.featuresTR,
        featuresEN: room.featuresEN,
        priceTR: room.priceTR,
        priceEN: room.priceEN,
        capacity: room.capacity,
        size: room.size,
        mainImageUrl: room.mainImageUrl,
        type: room.type,
        roomTypeId: room.roomTypeId,
        active: room.active,
        orderNumber: room.orderNumber
      }
    });
    
    // Her oda için galeri görsellerini ekleyelim
    const galleryImages = [
      {
        roomId: createdRoom.id,
        imageUrl: room.mainImageUrl,
        orderNumber: 0
      }
    ];

    // Standart oda
    if (room.type === 'standard') {
      galleryImages.push(...[
        { roomId: createdRoom.id, imageUrl: '/images/rooms/standart/standard-room2.jpg', orderNumber: 1 },
        { roomId: createdRoom.id, imageUrl: '/images/rooms/standart/standard-room3.jpg', orderNumber: 2 },
        { roomId: createdRoom.id, imageUrl: '/images/rooms/standart/standard-room4.jpg', orderNumber: 3 }
      ]);
    }
    // Üç kişilik oda
    else if (room.type === 'triple') {
      galleryImages.push(...[
        { roomId: createdRoom.id, imageUrl: '/images/rooms/triple/triple-room1.jpg', orderNumber: 1 },
        { roomId: createdRoom.id, imageUrl: '/images/rooms/triple/triple-room3.jpg', orderNumber: 2 },
        { roomId: createdRoom.id, imageUrl: '/images/rooms/triple/triple-room4.jpg', orderNumber: 3 }
      ]);
    }
    // Süit oda
    else if (room.type === 'suite') {
      galleryImages.push(...[
        { roomId: createdRoom.id, imageUrl: '/images/rooms/suite/suite-room2.jpg', orderNumber: 1 },
        { roomId: createdRoom.id, imageUrl: '/images/rooms/suite/suite-room3.jpg', orderNumber: 2 },
        { roomId: createdRoom.id, imageUrl: '/images/rooms/suite/suite-room4.jpg', orderNumber: 3 }
      ]);
    }
    // Apart oda
    else if (room.type === 'apart') {
      galleryImages.push(...[
        { roomId: createdRoom.id, imageUrl: '/images/rooms/apart/apart-room2.jpg', orderNumber: 1 },
        { roomId: createdRoom.id, imageUrl: '/images/rooms/apart/apart-room3.jpg', orderNumber: 2 },
        { roomId: createdRoom.id, imageUrl: '/images/rooms/apart/apart-room4.jpg', orderNumber: 3 }
      ]);
    }

    // Galeri görsellerini ekleyelim
    await prisma.roomGallery.createMany({
      data: galleryImages
    });

    console.log(`Oda galerisi eklendi (${galleryImages.length} görsel): ${room.nameTR}`);
  }

  console.log(`${rooms.length} oda başarıyla eklendi.`);
  console.log('Veritabanı seed işlemi tamamlandı.');
}

main()
  .catch((e) => {
    console.error('Seed işlemi sırasında hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 