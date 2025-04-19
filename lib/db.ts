import { PrismaClient } from '@prisma/client';

// PrismaClient örneğini global olarak tanımla
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Geliştirme ortamında birden fazla Prisma örneği oluşturulmasını önle
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// SQL sorguları yürütmek için yardımcı fonksiyon
export async function executeQuery(query: string, params: unknown[] = []) {
  try {
    return await prisma.$queryRawUnsafe(query, ...params);
  } catch (error) {
    console.error('Veritabanı sorgusu hatası:', error);
    throw error;
  }
}

// Varsayılan olarak prisma nesnesini dışa aktar
export default prisma; 