'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, User, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  username: string;
}

export function AvatarUpload({ currentAvatar, username }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(currentAvatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setMessage(null);
    
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await fetch('/api/users/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.avatarUrl) {
        setMessage({ type: 'success', text: 'Avatar uploaded successfully!' });
        setUploadedAvatar(data.avatarUrl);
        setPreview(data.avatarUrl);
        setSelectedFile(null);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to upload avatar' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload avatar. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="border-eco-leaf/20 shadow-eco overflow-hidden bg-card/90">
      <CardContent className="p-6 bg-opacity-90">
        <div className="flex flex-col items-center space-y-6">
          {/* Avatar Preview */}
          <div className="relative hover:scale-105 transition-transform duration-200">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-eco-leaf/30 shadow-eco-lg bg-gradient-to-br from-eco-leaf/20 to-eco-forest/20">
              {(uploadedAvatar || preview) ? (
                <Image
                  src={uploadedAvatar || preview || ''}
                  alt={username}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-eco-leaf to-eco-forest">
                  <span className="text-4xl font-bold text-white">
                    {getInitials(username)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Camera Icon Overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-eco-leaf to-eco-forest rounded-full shadow-eco-lg border-2 border-white hover:scale-110 active:scale-95 transition-transform"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full p-6 border-2 border-dashed rounded-lg transition-all duration-300 ${
              isDragging
                ? 'border-eco-leaf bg-eco-leaf/10 scale-105'
                : 'border-eco-leaf/30 bg-eco-leaf/5 hover:border-eco-leaf/50'
            }`}
          >
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="p-3 bg-gradient-to-br from-eco-leaf/20 to-eco-forest/20 rounded-full">
                <Upload className="w-6 h-6 text-eco-forest" />
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-eco-forest">
                  Drop your image here or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-eco-leaf hover:text-eco-forest underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-eco-forest/60">
                  PNG, JPG or GIF (max. 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Message Display */}
          {message && (
            <div
              className={`w-full p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Upload Button */}
          {preview && selectedFile && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-leaf/90 hover:to-eco-forest/90 text-white shadow-eco hover:shadow-eco-lg transition-all duration-300 hover:scale-[1.02]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Avatar
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
