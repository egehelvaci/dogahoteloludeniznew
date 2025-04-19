'use client';

import React, { useState } from 'react';
import { Button, Input, Form, Card, Select, Divider } from 'antd';
import ImageKitImage from '../../../components/ui/ImageKitImage';
import ImageKitVideo from '../../../components/ui/ImageKitVideo';

const { Option } = Select;

const ImageKitTestPage = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [imageSettings, setImageSettings] = useState({
    width: 400,
    height: 300,
    quality: 'auto',
    format: 'auto',
    blur: 0,
  });
  const [videoSettings, setVideoSettings] = useState({
    quality: 'auto',
    format: 'auto',
    controls: true,
    autoPlay: false,
    muted: true,
    loop: false,
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">ImageKit Test Sayfası</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Resim Testi */}
        <Card title="ImageKit Resim Test" className="mb-8">
          <Form layout="vertical">
            <Form.Item label="Resim URL">
              <Input 
                placeholder="ImageKit Resim URL'si girin" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
              />
            </Form.Item>
            
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Genişlik">
                <Input 
                  type="number" 
                  value={imageSettings.width} 
                  onChange={(e) => setImageSettings({...imageSettings, width: Number(e.target.value)})} 
                />
              </Form.Item>
              
              <Form.Item label="Yükseklik">
                <Input 
                  type="number" 
                  value={imageSettings.height} 
                  onChange={(e) => setImageSettings({...imageSettings, height: Number(e.target.value)})} 
                />
              </Form.Item>
              
              <Form.Item label="Kalite">
                <Select 
                  value={imageSettings.quality} 
                  onChange={(value) => setImageSettings({...imageSettings, quality: value})}
                >
                  <Option value="auto">Otomatik</Option>
                  <Option value="100">100</Option>
                  <Option value="80">80</Option>
                  <Option value="60">60</Option>
                  <Option value="40">40</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Format">
                <Select 
                  value={imageSettings.format} 
                  onChange={(value) => setImageSettings({...imageSettings, format: value})}
                >
                  <Option value="auto">Otomatik</Option>
                  <Option value="webp">WEBP</Option>
                  <Option value="jpg">JPG</Option>
                  <Option value="png">PNG</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Bulanıklık">
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={imageSettings.blur} 
                  onChange={(e) => setImageSettings({...imageSettings, blur: Number(e.target.value)})} 
                />
              </Form.Item>
            </div>
          </Form>
          
          <Divider />
          
          {imageUrl ? (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Sonuç:</h4>
              <div className="border p-2">
                <ImageKitImage
                  src={imageUrl}
                  width={imageSettings.width}
                  height={imageSettings.height}
                  quality={imageSettings.quality === 'auto' ? 'auto' : Number(imageSettings.quality)}
                  format={imageSettings.format as any}
                  blur={imageSettings.blur}
                  alt="Test resmi"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100">
              <p>Görüntülemek için bir resim URL'si girin</p>
            </div>
          )}
        </Card>
        
        {/* Video Testi */}
        <Card title="ImageKit Video Test" className="mb-8">
          <Form layout="vertical">
            <Form.Item label="Video URL">
              <Input 
                placeholder="ImageKit Video URL'si girin" 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
              />
            </Form.Item>
            
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Kalite">
                <Select 
                  value={videoSettings.quality} 
                  onChange={(value) => setVideoSettings({...videoSettings, quality: value})}
                >
                  <Option value="auto">Otomatik</Option>
                  <Option value="100">100</Option>
                  <Option value="80">80</Option>
                  <Option value="60">60</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Format">
                <Select 
                  value={videoSettings.format} 
                  onChange={(value) => setVideoSettings({...videoSettings, format: value})}
                >
                  <Option value="auto">Otomatik</Option>
                  <Option value="mp4">MP4</Option>
                  <Option value="webm">WEBM</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Kontroller">
                <Select 
                  value={videoSettings.controls ? 'true' : 'false'} 
                  onChange={(value) => setVideoSettings({...videoSettings, controls: value === 'true'})}
                >
                  <Option value="true">Göster</Option>
                  <Option value="false">Gizle</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Otomatik Oynatma">
                <Select 
                  value={videoSettings.autoPlay ? 'true' : 'false'} 
                  onChange={(value) => setVideoSettings({...videoSettings, autoPlay: value === 'true'})}
                >
                  <Option value="true">Açık</Option>
                  <Option value="false">Kapalı</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Sessiz">
                <Select 
                  value={videoSettings.muted ? 'true' : 'false'} 
                  onChange={(value) => setVideoSettings({...videoSettings, muted: value === 'true'})}
                >
                  <Option value="true">Açık</Option>
                  <Option value="false">Kapalı</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Döngü">
                <Select 
                  value={videoSettings.loop ? 'true' : 'false'} 
                  onChange={(value) => setVideoSettings({...videoSettings, loop: value === 'true'})}
                >
                  <Option value="true">Açık</Option>
                  <Option value="false">Kapalı</Option>
                </Select>
              </Form.Item>
            </div>
          </Form>
          
          <Divider />
          
          {videoUrl ? (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Sonuç:</h4>
              <div className="border p-2">
                <ImageKitVideo
                  src={videoUrl}
                  quality={videoSettings.quality === 'auto' ? 'auto' : Number(videoSettings.quality)}
                  format={videoSettings.format as any}
                  controls={videoSettings.controls}
                  autoPlay={videoSettings.autoPlay}
                  muted={videoSettings.muted}
                  loop={videoSettings.loop}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100">
              <p>Görüntülemek için bir video URL'si girin</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ImageKitTestPage; 