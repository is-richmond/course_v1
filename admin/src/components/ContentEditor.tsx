"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Image,
  Video,
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
  ListOrdered,
  Palette,
  Space,
  FolderOpen,
  Trash2,
  X,
  IndentIncrease,
  IndentDecrease,
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
  media_type: "image" | "video";
  created_at?: string;
}

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
  const [visualMode, setVisualMode] = useState(true); // Новый режим - визуальный
  const [uploadedImages, setUploadedImages] = useState<Map<string, UploadedMedia>>(new Map());
  
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [libraryMedia, setLibraryMedia] = useState<UploadedMedia[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  
  const [showSpacingModal, setShowSpacingModal] = useState(false);
  const [spacingValue, setSpacingValue] = useState("1");
  
  const [showIndentModal, setShowIndentModal] = useState(false);
  const [indentValue, setIndentValue] = useState("2");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const visualEditorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const predefinedColors = [
    "#000000", "#333333", "#666666", "#999999",
    "#FF0000", "#FF6B6B", "#FFA500", "#FFD700",
    "#00FF00", "#00CC66", "#0000FF", "#6B8EFF",
    "#800080", "#FF00FF", "#8B4513", "#FFFFFF"
  ];

  const wrapSelection = useCallback((openTag: string, closeTag: string) => {
    if (visualMode) {
      // В визуальном режиме работаем с contentEditable
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      const wrapper = document.createElement("span");
      wrapper.innerHTML = openTag + selectedText + closeTag;
      
      range.deleteContents();
      range.insertNode(wrapper);
      
      updateFromVisual();
    } else {
      // В текстовом режиме - старая логика
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

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + openTag.length + selectedText.length + closeTag.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  }, [value, onChange, visualMode]);

  const wrapLine = useCallback((openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
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
      const newCursorPos = lineStart + openTag.length + lineText.length + closeTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const makeBulletList = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

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
    setTimeout(() => textarea.focus(), 0);
  }, [value, onChange]);

  const makeNumberedList = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    let lineStart = value.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = value.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = value.length;

    const selectedLines = value.substring(lineStart, lineEnd);
    const lines = selectedLines.split("\n");
    const listItems = lines
      .map((line) => (line.trim() ? `<li>${line.trim()}</li>` : ""))
      .join("\n");
    const numberedList = `<ol>\n${listItems}\n</ol>`;

    const newValue =
      value.substring(0, lineStart) + numberedList + value.substring(lineEnd);

    onChange(newValue);
    setTimeout(() => textarea.focus(), 0);
  }, [value, onChange]);

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue =
      value.substring(0, start) + text + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const applyColor = (color: string) => {
    wrapSelection(`<span style="color: ${color}">`, `</span>`);
    setShowColorPicker(false);
  };

  const applySpacing = () => {
    insertAtCursor(`<div style="margin-bottom: ${spacingValue}rem"></div>`);
    setShowSpacingModal(false);
    setSpacingValue("1");
  };

  const applyIndent = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    let lineStart = value.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = value.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = value.length;

    const selectedText = value.substring(lineStart, lineEnd);
    const indentedText = `<div style="margin-left: ${indentValue}rem">${selectedText}</div>`;

    const newValue =
      value.substring(0, lineStart) + indentedText + value.substring(lineEnd);

    onChange(newValue);
    setShowIndentModal(false);
    setIndentValue("2");
  };

  const updateFromVisual = () => {
    if (visualEditorRef.current) {
      onChange(visualEditorRef.current.innerHTML);
    }
  };

  const handleMediaUpload = async (file: File, mediaType: "image" | "video") => {
    setUploading(true);
    setUploadError(null);

    try {
      console.log("📁 Выбранный файл:", file.name);
      console.log("📊 Размер файла:", (file.size / 1024 / 1024).toFixed(2), "MB");
      console.log("🎭 MIME тип:", file.type);

      const validTypes = mediaType === "image" 
        ? ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        : [
            "video/mp4",
            "video/webm",
            "video/ogg",
            "video/quicktime",
            "video/x-msvideo",
            "video/mpeg",
            "video/x-matroska",
          ];

      if (!validTypes.includes(file.type)) {
        const errorMsg = `Неподдерживаемый формат: ${file.type}`;
        console.error("❌", errorMsg);
        throw new Error(errorMsg);
      }

      const maxSize = mediaType === "image" ? 10 * 1024 * 1024 : 500 * 1024 * 1024;
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);

      if (file.size > maxSize) {
        const errorMsg = `Файл слишком большой: ${fileSizeMB} MB. Максимум: ${maxSizeMB} MB`;
        console.error("❌", errorMsg);
        throw new Error(errorMsg);
      }

      console.log("⬆️ Начинаем загрузку...");

      const response = await s3Api.uploadMedia(
        file,
        mediaType,
        courseId,
        lessonId,
        file.name
      );

      console.log("✅ Ответ от сервера:", response);

      const media = response.media;

      setUploadedImages((prev) =>
        new Map(prev).set(media.id, {
          id: media.id,
          filename: media.original_filename || media.filename,
          download_url: media.download_url,
          media_type: mediaType,
        })
      );

      const placeholder = mediaType === "image" ? `[IMAGE:${media.id}]` : `[VIDEO:${media.id}]`;
      insertAtCursor(placeholder);

      console.log(`✅ ${mediaType} успешно загружен:`, media.id);
    } catch (error: any) {
      console.error("❌ Ошибка загрузки:", error);
      console.error("❌ Детали:", error.response?.data);

      setUploadError(
        error.response?.data?.detail ||
          error.message ||
          "Не удалось загрузить файл. Проверьте консоль для деталей."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const loadMediaLibrary = async () => {
    setLoadingLibrary(true);
    try {
      const response = await s3Api.getAllMedia(courseId);
      setLibraryMedia(response.media.map((m: any) => ({
        id: m.id,
        filename: m.original_filename || m.filename,
        download_url: m.download_url,
        media_type: m.media_type,
        created_at: m.created_at,
      })));
    } catch (error) {
      console.error("Error loading media library:", error);
      setUploadError("Не удалось загрузить библиотеку медиа");
    } finally {
      setLoadingLibrary(false);
    }
  };

  const insertMediaFromLibrary = (media: UploadedMedia) => {
    const placeholder = media.media_type === "image" ? `[IMAGE:${media.id}]` : `[VIDEO:${media.id}]`;
    insertAtCursor(placeholder);
    setShowMediaLibrary(false);
  };

  const deleteMediaFromLibrary = async (mediaId: string) => {
    try {
      await s3Api.deleteMedia(mediaId);
      setLibraryMedia((prev) => prev.filter((m) => m.id !== mediaId));
    } catch (error) {
      console.error("Error deleting media:", error);
      setUploadError("Не удалось удалить файл");
    }
  };

  const renderVisualContent = () => {
    if (!value) {
      return <p className="text-gray-400 italic">Начните вводить текст...</p>;
    }

    let visualContent = value;

    // Заменяем медиа-плейсхолдеры на реальные элементы
    visualContent = visualContent.replace(
      /\[IMAGE:([^\]]+)\]/g,
      (match, mediaId) => {
        const imageInfo = uploadedImages.get(mediaId) || libraryMedia.find(m => m.id === mediaId);
        if (imageInfo?.download_url) {
          return `<div class="media-placeholder image-placeholder" data-media-id="${mediaId}">
            <img src="${imageInfo.download_url}" alt="${imageInfo.filename}" style="max-width: 100%; height: auto; border-radius: 0.5rem;" />
            <span class="media-label">📷 ${imageInfo.filename}</span>
          </div>`;
        }
        return `<span class="media-placeholder" data-media-id="${mediaId}">📷 Изображение: ${mediaId.substring(0, 8)}...</span>`;
      }
    );

    visualContent = visualContent.replace(
      /\[VIDEO:([^\]]+)\]/g,
      (match, mediaId) => {
        const videoInfo = uploadedImages.get(mediaId) || libraryMedia.find(m => m.id === mediaId);
        if (videoInfo?.download_url) {
          return `<div class="media-placeholder video-placeholder" data-media-id="${mediaId}">
            <video controls style="max-width: 100%; height: auto; border-radius: 0.5rem;">
              <source src="${videoInfo.download_url}" type="video/mp4">
            </video>
            <span class="media-label">🎥 ${videoInfo.filename}</span>
          </div>`;
        }
        return `<span class="media-placeholder" data-media-id="${mediaId}">🎥 Видео: ${mediaId.substring(0, 8)}...</span>`;
      }
    );

    return visualContent;
  };

  const renderPreview = () => {
    if (!value) {
      return <p className="text-gray-400 italic">Нет контента для превью</p>;
    }

    let previewContent = value;
    
    previewContent = previewContent.replace(
      /\[IMAGE:([^\]]+)\]/g,
      (match, mediaId) => {
        const imageInfo = uploadedImages.get(mediaId) || libraryMedia.find(m => m.id === mediaId);
        if (imageInfo?.download_url) {
          return `<img src="${imageInfo.download_url}" alt="${imageInfo.filename}" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;" />`;
        }
        return `<div style="padding: 1rem; background: #f3f4f6; border-radius: 0.5rem; text-align: center; color: #6b7280;">Изображение: ${mediaId.substring(0, 8)}...</div>`;
      }
    );

    previewContent = previewContent.replace(
      /\[VIDEO:([^\]]+)\]/g,
      (match, mediaId) => {
        const videoInfo = uploadedImages.get(mediaId) || libraryMedia.find(m => m.id === mediaId);
        if (videoInfo?.download_url) {
          return `<video controls style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;">
            <source src="${videoInfo.download_url}" type="video/mp4">
            Ваш браузер не поддерживает видео.
          </video>`;
        }
        return `<div style="padding: 1rem; background: #f3f4f6; border-radius: 0.5rem; text-align: center; color: #6b7280;">Видео: ${mediaId.substring(0, 8)}...</div>`;
      }
    );

    return (
      <div
        className="prose prose-sm sm:prose-base max-w-none lesson-content"
        dangerouslySetInnerHTML={{ __html: previewContent }}
      />
    );
  };

  const countMedia = () => {
    const images = (value.match(/\[IMAGE:[^\]]+\]/g) || []).length;
    const videos = (value.match(/\[VIDEO:[^\]]+\]/g) || []).length;
    return { images, videos };
  };

  const mediaCount = countMedia();

  return (
    <div className="space-y-2 sm:space-y-3">
      <style jsx>{`
        .media-placeholder {
          display: inline-block;
          padding: 0.5rem;
          background: #f0f9ff;
          border: 2px dashed #3b82f6;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
          font-size: 0.875rem;
          color: #1e40af;
        }
        .media-label {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        .visual-editor {
          min-height: 300px;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          outline: none;
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.6;
        }
        .visual-editor:focus {
          border-color: #3b82f6;
        }
        .visual-editor strong {
          font-weight: 700;
        }
        .visual-editor em {
          font-style: italic;
        }
        .visual-editor h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1rem 0;
        }
        .visual-editor h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0.75rem 0;
        }
        .visual-editor h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }
        .visual-editor ul, .visual-editor ol {
          margin-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .visual-editor li {
          margin: 0.25rem 0;
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
          <span>{mediaCount.images} изобр.</span>
          <span>{mediaCount.videos} видео</span>
          <span>{value.length} симв.</span>
        </div>
      </div>

      <Card className="border-2">
        <CardContent className="p-2">
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => wrapSelection("<strong>", "</strong>")}
              title="Жирный"
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

            <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block" />

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

              <div className="h-6 w-px bg-gray-300 mx-1" />
            </div>

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

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={makeNumberedList}
              title="Нумерованный список"
              className="h-8 w-8 p-0"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-gray-300 mx-1" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowIndentModal(true)}
              title="Отступ слева"
              className="h-8 w-8 p-0"
            >
              <IndentIncrease className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-gray-300 mx-1" />

            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Цвет текста"
                className="h-8 w-8 p-0"
              >
                <Palette className="w-4 h-4" />
              </Button>

              {showColorPicker && (
                <div className="absolute top-10 left-0 z-50 bg-white border-2 rounded-lg shadow-lg p-3">
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => applyColor(color)}
                        className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full h-8"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => applyColor(selectedColor)}
                    className="w-full mt-2"
                  >
                    Применить
                  </Button>
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSpacingModal(true)}
              title="Отступ снизу"
              className="h-8 w-8 p-0"
            >
              <Space className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-gray-300 mx-1" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-8 px-2 sm:px-3"
              title="Загрузить изображение"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Image className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1 text-xs">Фото</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
              className="h-8 px-2 sm:px-3"
              title="Загрузить видео"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline ml-1 text-xs">Видео</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowMediaLibrary(true);
                loadMediaLibrary();
              }}
              className="h-8 px-2 sm:px-3"
              title="Библиотека медиа"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline ml-1 text-xs">Медиа</span>
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleMediaUpload(file, "image");
              }}
              className="hidden"
            />

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/mpeg,video/x-matroska"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleMediaUpload(file, "video");
              }}
              className="hidden"
            />

            <div className="h-6 w-px bg-gray-300 mx-1" />

            <Button
              type="button"
              variant={previewMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setPreviewMode(!previewMode);
                setVisualMode(false);
              }}
              className="h-8 px-2 sm:px-3"
            >
              {previewMode ? (
                <>
                  <Code className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1 text-xs">Код</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1 text-xs">Превью</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-medium text-red-800">Ошибка</p>
            <p className="text-xs sm:text-sm text-red-600">{uploadError}</p>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {previewMode ? (
        <Card className="border-2">
          <CardContent className="p-3 sm:p-4 min-h-[200px] sm:min-h-[300px]">
            {renderPreview()}
          </CardContent>
        </Card>
      ) : visualMode ? (
        <div
          ref={visualEditorRef}
          contentEditable
          onInput={updateFromVisual}
          dangerouslySetInnerHTML={{ __html: renderVisualContent() }}
          className="visual-editor"
        />
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

      {showIndentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Отступ слева</h3>
              <div className="space-y-3">
                <Label>Размер отступа (rem)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={indentValue}
                  onChange={(e) => setIndentValue(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={applyIndent}
                    className="flex-1"
                  >
                    Применить
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowIndentModal(false)}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showSpacingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Добавить отступ снизу</h3>
              <div className="space-y-3">
                <Label>Размер отступа (rem)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={spacingValue}
                  onChange={(e) => setSpacingValue(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={applySpacing}
                    className="flex-1"
                  >
                    Применить
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSpacingModal(false)}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <CardContent className="p-4 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Библиотека медиа</h3>
                <button
                  onClick={() => setShowMediaLibrary(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingLibrary ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : libraryMedia.length === 0 ? (
                <p className="text-center text-gray-500 py-12">
                  Медиафайлы не найдены
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {libraryMedia.map((media) => (
                    <div
                      key={media.id}
                      className="border-2 rounded-lg p-2 hover:border-blue-500 transition-colors"
                    >
                      {media.media_type === "image" ? (
                        <img
                          src={media.download_url || ""}
                          alt={media.filename}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                      ) : (
                        <video
                          src={media.download_url || ""}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                      )}
                      <p className="text-xs truncate mb-2" title={media.filename}>
                        {media.filename}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => insertMediaFromLibrary(media)}
                          className="flex-1 text-xs"
                        >
                          Вставить
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMediaFromLibrary(media.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="text-[10px] sm:text-xs text-gray-500 space-y-1">
        <p>
          <strong>Форматирование:</strong> B/I = стиль, H1/H2/H3 = заголовки
        </p>
        <p>
          <strong>Списки:</strong> Bullet (•) = маркированный, 123 = нумерованный
        </p>
        <p>
          <strong>Отступы:</strong> → = отступ слева, ↓ = отступ снизу
        </p>
        <p>
          <strong>Режимы:</strong>Код = HTML, Превью = результат
        </p>
      </div>
    </div>
  );
};

export default ContentEditor;