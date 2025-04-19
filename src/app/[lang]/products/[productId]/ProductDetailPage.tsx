'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import { getProductByIdForLanguage } from '../../../data/products';
import { productDetails } from '../../../data/productDetails';

type ProductDetailPageProps = {
  lang: string;
  productId: string;
};

export default function ProductDetailPage({ lang, productId }: ProductDetailPageProps) {
  const language = lang;
  
  // Temel ürün verilerini al
  const product = getProductByIdForLanguage(productId, language);
  
  // Detay verilerini al
  const details = productDetails[productId];
  
  if (!product || !details) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">
          {language === 'tr' ? 'Ürün Bulunamadı' : 'Product Not Found'}
        </h1>
        <p className="mb-8">
          {language === 'tr' 
            ? 'İstediğiniz ürün bulunamadı veya kaldırılmış olabilir.' 
            : 'The product you requested could not be found or may have been removed.'}
        </p>
        <Link 
          href={`/${language}/products`}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FaArrowLeft className="mr-2" />
          {language === 'tr' ? 'Ürünlere Dön' : 'Back to Products'}
        </Link>
      </div>
    );
  }

  // Dil-tabanlı içerikleri al
  const subtitle = details.subtitle[language === 'tr' ? 'tr' : 'en'];
  const detailedFeatures = details.detailedFeatures[language === 'tr' ? 'tr' : 'en'];
  const applications = details.applications[language === 'tr' ? 'tr' : 'en'];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gray-800 py-20" style={{paddingTop: "7rem"}}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">{product.title}</h1>
            <p className="text-xl text-gray-300 mb-6">{subtitle}</p>
            <Link 
              href={`/${language}/products`}
              className="flex items-center text-gray-300 hover:text-white transition-colors mt-4"
            >
              <FaArrowLeft className="mr-2" /> 
              {language === 'tr' ? 'Tüm Ürünler' : 'All Products'}
            </Link>
          </div>
        </div>
      </section>

      {/* Product Detail Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Main Image */}
            <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
              <Image 
                src={details.mainImage} 
                alt={product.title}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            
            {/* Product Description */}
            <div>
              <h2 className="text-3xl font-bold mb-6">
                {language === 'tr' ? 'Ürün Açıklaması' : 'Product Description'}
              </h2>
              <p className="text-gray-700 mb-8 leading-relaxed">
                {product.description}
              </p>
              
              <h3 className="text-2xl font-bold mb-4">
                {language === 'tr' ? 'Özellikler' : 'Features'}
              </h3>
              <ul className="grid grid-cols-1 mb-8 gap-3">
                {detailedFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <FaCheck className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">
            {language === 'tr' ? 'Kullanım Alanları' : 'Applications'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((application, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
                    {index + 1}
                  </div>
                  <h3 className="font-bold">{application}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">
            {language === 'tr' ? 'Daha Fazla Bilgi Almak İster misiniz?' : 'Would You Like to Get More Information?'}
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            {language === 'tr' 
              ? `${product.title} ürünümüz hakkında daha detaylı bilgi ve fiyat teklifi için bizimle iletişime geçin.` 
              : `Contact us for more detailed information and price quotes about our ${product.title} product.`}
          </p>
          <Link 
            href={`/${language}/contact`}
            className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-md transition-colors inline-flex items-center"
          >
            {language === 'tr' ? 'İletişime Geçin' : 'Contact Us'} 
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </>
  );
} 