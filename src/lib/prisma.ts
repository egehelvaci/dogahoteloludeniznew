import { PrismaClient } from "@prisma/client";

// Global PrismaClient örneği için typescript tipi tanımla
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Mevcut global örneği al veya yeni oluştur
export const prisma = globalForPrisma.prisma || new PrismaClient();

// Geliştirme modunda global örneği kaydet (hot reload problemini çözer)
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 