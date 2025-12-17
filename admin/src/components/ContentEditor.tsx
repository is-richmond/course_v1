'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/text-area';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Image as ImageIcon, 
  Upload, 
  Loader2,
  Eye,
  Code,
  AlertCircle
} from 'lucide-react';
import { s3Api } from '@/lib/api/api';

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  courseId?: number;
  lessonId?: number;
  placeholder?: string;
  label?: string;
  rows?: number;
}

interface UploadedMedia {
  id: string;
  filename: string;
  download_url: string | null;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  value,
  onChange,
  courseId,
  lessonId,
  placeholder = 'Enter lesson content...',
  label = 'Content',
  rows = 12,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Map<string, UploadedMedia>>(new Map());
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Insert text at cursor position
  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value;

    const newValue = 
      currentValue.substring(0, start) + 
      text + 
      currentValue.substring(end);

    onChange(newValue);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 10MB');
      }

      // Upload to server
      const response = await s3Api.uploadMedia(
        file,
        'image',
        courseId,
        lessonId,
        file.name
      );

      const media = response.media;
      
      // Store uploaded image info
      setUploadedImages(prev => new Map(prev).set(media.id, {
        id: media.id,
        filename: media.original_filename || media.filename,
        download_url: media.download_url,
      }));

      // Insert placeholder at cursor position
      const placeholder = `[IMAGE:${media.id}]`;
      insertAtCursor(placeholder);

      // Show success message
      console.log('Image uploaded successfully:', media.id);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(
        error.response?.data?.detail || 
        error.message || 
        'Failed to upload image'
      );
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Render preview with images
  const renderPreview = () => {
    if (!value) {
      return <p className="text-gray-400 italic">No content to preview</p>;
    }

    // Replace placeholders with image tags
    const parts = value.split(/(\[IMAGE:[^\]]+\])/g);
    
    return (
      <div className="prose max-w-none">
        {parts.map((part, index) => {
          // Check if this is an image placeholder
          const match = part.match(/\[IMAGE:([^\]]+)\]/);
          if (match) {
            const mediaId = match[1];
            const imageInfo = uploadedImages.get(mediaId);
            
            return (
              <div key={index} className="my-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Image: {mediaId.substring(0, 8)}...
                    </span>
                  </div>
                  {imageInfo?.download_url ? (
                    <img 
                      src={imageInfo.download_url} 
                      alt={imageInfo.filename}
                      className="max-w-full h-auto rounded"
                    />
                  ) : (
                    <div className="bg-gray-200 h-48 rounded flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Image will be loaded from server</p>
                    </div>
                  )}
                </div>
              </div>
            );
          }
          
          // Regular text - preserve line breaks
          return (
            <div key={index} className="whitespace-pre-wrap">
              {part}
            </div>
          );
        })}
      </div>
    );
  };

  // Count placeholders in text
  const countImages = () => {
    const matches = value.match(/\[IMAGE:[^\]]+\]/g);
    return matches ? matches.length : 0;
  };

  return (
    <div className="space-y-2">
      {/* Label and Stats */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{countImages()} image(s)</span>
          <span>{value.length} characters</span>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="border-2">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            {/* Insert Image Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Insert Image
                </>
              )}
            </Button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300" />

            {/* Preview Toggle */}
            <Button
              type="button"
              variant={previewMode ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              {previewMode ? (
                <>
                  <Code className="w-4 h-4" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Preview
                </>
              )}
            </Button>

            {/* Info */}
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
              <ImageIcon className="w-3 h-3" />
              <span>Use [IMAGE:id] placeholder for images</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Upload Failed</p>
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Editor / Preview */}
      {previewMode ? (
        <Card className="border-2">
          <CardContent className="p-4 min-h-[300px]">
            {renderPreview()}
          </CardContent>
        </Card>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="font-mono text-sm"
        />
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Click "Insert Image" to upload and insert an image placeholder</p>
        <p>• Image placeholders format: [IMAGE:media_id]</p>
        <p>• Maximum image size: 10MB</p>
        <p>• Supported formats: JPG, PNG, GIF, WebP</p>
      </div>
    </div>
  );
};

export default ContentEditor;