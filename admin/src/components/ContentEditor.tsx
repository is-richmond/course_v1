"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Image as ImageIcon,
  Loader2,
  Eye,
  Code,
  AlertCircle,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
} from "lucide-react";
import { s3Api } from "@/lib/api/api";

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

/**
 * ContentEditor - WYSIWYG редактор контента урока
 * - Адаптивный дизайн (mobile-first)
 * - Загрузка изображений
 * - Форматирование текста (bold, italic, headings, lists)
 * - Превью режим
 */
const ContentEditor: React.FC<ContentEditorProps> = ({
  value,
  onChange,
  courseId,
  lessonId,
  placeholder = "Введите контент урока...",
  label = "Контент",
  rows = 12,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<
    Map<string, UploadedMedia>
  >(new Map());

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current selection
  const getSelection = (): {
    start: number;
    end: number;
    text: string;
  } | null => {
    const textarea = textareaRef.current;
    if (!textarea) return null;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value.substring(start, end);

    return { start, end, text };
  };

  // Wrap selected text with tags
  const wrapSelection = useCallback(
    (openTag: string, closeTag: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      const newValue =
        value.substring(0, start) +
        openTag +
        selectedText +
        closeTag +
        value.substring(end);

      onChange(newValue);

      // Set cursor position after the inserted text
      setTimeout(() => {
        textarea.focus();
        const newCursorPos =
          start + openTag.length + selectedText.length + closeTag.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  // Wrap line with block-level tags (for headings)
  const wrapLine = useCallback(
    (openTag: string, closeTag: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursorPos = textarea.selectionStart;

      // Find line start and end
      let lineStart = value.lastIndexOf("\n", cursorPos - 1) + 1;
      let lineEnd = value.indexOf("\n", cursorPos);
      if (lineEnd === -1) lineEnd = value.length;

      const lineText = value.substring(lineStart, lineEnd);

      const newValue =
        value.substring(0, lineStart) +
        openTag +
        lineText +
        closeTag +
        value.substring(lineEnd);

      onChange(newValue);

      setTimeout(() => {
        textarea.focus();
        const newCursorPos =
          lineStart + openTag.length + lineText.length + closeTag.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  // Convert selected lines to bullet list
  const makeBulletList = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find line boundaries
    let lineStart = value.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = value.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = value.length;

    const selectedLines = value.substring(lineStart, lineEnd);
    const lines = selectedLines.split("\n");

    const listItems = lines
      .map((line) => (line.trim() ? `<li>${line.trim()}</li>` : ""))
      .join("\n");
    const bulletList = `<ul>\n${listItems}\n</ul>`;

    const newValue =
      value.substring(0, lineStart) + bulletList + value.substring(lineEnd);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  // Insert text at cursor position
  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value;

    const newValue =
      currentValue.substring(0, start) + text + currentValue.substring(end);

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
      if (!file.type.startsWith("image/")) {
        throw new Error("Пожалуйста, выберите изображение");
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("Размер изображения не должен превышать 10MB");
      }

      // Upload to server
      const response = await s3Api.uploadMedia(
        file,
        "image",
        courseId,
        lessonId,
        file.name
      );

      const media = response.media;

      // Store uploaded image info
      setUploadedImages((prev) =>
        new Map(prev).set(media.id, {
          id: media.id,
          filename: media.original_filename || media.filename,
          download_url: media.download_url,
        })
      );

      // Insert placeholder at cursor position
      const placeholder = `[IMAGE:${media.id}]`;
      insertAtCursor(placeholder);

      // Show success message
      console.log("Image uploaded successfully:", media.id);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(
        error.response?.data?.detail ||
          error.message ||
          "Не удалось загрузить изображение"
      );
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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

  // Render preview with images and HTML
  const renderPreview = () => {
    if (!value) {
      return <p className="text-gray-400 italic">Нет контента для превью</p>;
    }

    // Replace [IMAGE:...] placeholders with actual images
    let previewContent = value;
    const placeholderRegex = /\[IMAGE:([^\]]+)\]/g;

    previewContent = previewContent.replace(
      placeholderRegex,
      (match, mediaId) => {
        const imageInfo = uploadedImages.get(mediaId);
        if (imageInfo?.download_url) {
          return `<img src="${imageInfo.download_url}" alt="${imageInfo.filename}" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;" />`;
        }
        return `<div style="padding: 1rem; background: #f3f4f6; border-radius: 0.5rem; text-align: center; color: #6b7280;">Изображение: ${mediaId.substring(
          0,
          8
        )}...</div>`;
      }
    );

    return (
      <div
        className="prose prose-sm sm:prose-base max-w-none lesson-content"
        dangerouslySetInnerHTML={{ __html: previewContent }}
      />
    );
  };

  // Count placeholders in text
  const countImages = () => {
    const matches = value.match(/\[IMAGE:[^\]]+\]/g);
    return matches ? matches.length : 0;
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Label and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
          <span>{countImages()} изобр.</span>
          <span>{value.length} симв.</span>
        </div>
      </div>

      {/* Toolbar - RESPONSIVE */}
      <Card className="border-2">
        <CardContent className="p-2">
          <div className="flex items-center gap-1 flex-wrap">
            {/* Formatting buttons */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => wrapSelection("<strong>", "</strong>")}
              title="Жирный текст"
              className="h-8 w-8 p-0"
            >
              <Bold className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => wrapSelection("<em>", "</em>")}
              title="Курсив"
              className="h-8 w-8 p-0"
            >
              <Italic className="w-4 h-4" />
            </Button>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300 mx-0.5 sm:mx-1 hidden sm:block" />

            {/* Headings - hidden on small screens, shown in dropdown or visible */}
            <div className="hidden sm:flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => wrapLine("<h1>", "</h1>")}
                title="Заголовок 1"
                className="h-8 w-8 p-0"
              >
                <Heading1 className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => wrapLine("<h2>", "</h2>")}
                title="Заголовок 2"
                className="h-8 w-8 p-0"
              >
                <Heading2 className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => wrapLine("<h3>", "</h3>")}
                title="Заголовок 3"
                className="h-8 w-8 p-0"
              >
                <Heading3 className="w-4 h-4" />
              </Button>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-300 mx-1" />
            </div>

            {/* List */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={makeBulletList}
              title="Маркированный список"
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300 mx-0.5 sm:mx-1" />

            {/* Insert Image Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1 sm:gap-2 h-8 px-2 sm:px-3"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline text-xs">Загрузка...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Изображение</span>
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
            <div className="h-6 w-px bg-gray-300 mx-0.5 sm:mx-1" />

            {/* Preview Toggle */}
            <Button
              type="button"
              variant={previewMode ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-1 sm:gap-2 h-8 px-2 sm:px-3"
            >
              {previewMode ? (
                <>
                  <Code className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Редактор</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Превью</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-red-800">
              Ошибка загрузки
            </p>
            <p className="text-xs sm:text-sm text-red-600">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Editor / Preview */}
      {previewMode ? (
        <Card className="border-2">
          <CardContent className="p-3 sm:p-4 min-h-[200px] sm:min-h-[300px]">
            {renderPreview()}
          </CardContent>
        </Card>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-xs sm:text-sm focus:outline-none focus:border-blue-500 resize-y min-h-[200px] sm:min-h-[300px]"
        />
      )}

      {/* Help Text - RESPONSIVE */}
      <div className="text-[10px] sm:text-xs text-gray-500 space-y-1">
        <p>
          <strong>Форматирование:</strong>{" "}
          <span className="hidden sm:inline">
            B = жирный, I = курсив, H1/H2/H3 = заголовки, List = список
          </span>
          <span className="sm:hidden">B = жирный, I = курсив</span>
        </p>
        <p>
          <strong>Изображения:</strong> Нажмите кнопку для загрузки. Формат:
          [IMAGE:media_id]
        </p>
      </div>
    </div>
  );
};

export default ContentEditor;
