"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
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
  Palette,
  Space,
  FolderOpen,
  Trash2,
  X,
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
  const [codeMode, setCodeMode] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Map<string, UploadedMedia>>(new Map());
  
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [libraryMedia, setLibraryMedia] = useState<UploadedMedia[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  
  const [showSpacingModal, setShowSpacingModal] = useState(false);
  const [spacingValue, setSpacingValue] = useState("1");

  const editableRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const isUpdatingRef = useRef(false);

  const predefinedColors = [
    "#000000", "#333333", "#666666", "#999999",
    "#FF0000", "#FF6B6B", "#FFA500", "#FFD700",
    "#00FF00", "#00CC66", "#0000FF", "#6B8EFF",
    "#800080", "#FF00FF", "#8B4513", "#FFFFFF"
  ];

  const renderEditableContent = (content: string) => {
    if (!content) return "";
    
    let rendered = content;
    
    // Заменяем плейсхолдеры изображений на превью
    rendered = rendered.replace(
      /\[IMAGE:([^\]]+)\]/g,
      (match, mediaId) => {
        const imageInfo = uploadedImages.get(mediaId) || libraryMedia.find(m => m.id === mediaId);
        if (imageInfo?.download_url) {
          return `<img src="${imageInfo.download_url}" alt="${imageInfo.filename}" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; display: block;" data-media-id="${mediaId}" data-media-type="image" />`;
        }
        return `<div style="padding: 1rem; background: #f3f4f6; border-radius: 0.5rem; text-align: center; color: #6b7280; margin: 1rem 0;" data-media-id="${mediaId}" data-media-type="image">Изображение: ${mediaId.substring(0, 8)}...</div>`;
      }
    );

    // Заменяем плейсхолдеры видео на превью
    rendered = rendered.replace(
      /\[VIDEO:([^\]]+)\]/g,
      (match, mediaId) => {
        const videoInfo = uploadedImages.get(mediaId) || libraryMedia.find(m => m.id === mediaId);
        if (videoInfo?.download_url) {
          return `<video controls style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; display: block;" data-media-id="${mediaId}" data-media-type="video">
            <source src="${videoInfo.download_url}" type="video/mp4">
            Ваш браузер не поддерживает видео.
          </video>`;
        }
        return `<div style="padding: 1rem; background: #f3f4f6; border-radius: 0.5rem; text-align: center; color: #6b7280; margin: 1rem 0;" data-media-id="${mediaId}" data-media-type="video">Видео: ${mediaId.substring(0, 8)}...</div>`;
      }
    );

    return rendered;
  };

  const convertHTMLToPlaceholders = (html: string) => {
    let content = html;
    
    // Конвертируем изображения обратно в плейсхолдеры
    content = content.replace(
      /<img[^>]+data-media-id="([^"]+)"[^>]*>/g,
      (match, mediaId) => `[IMAGE:${mediaId}]`
    );
    
    content = content.replace(
      /<div[^>]+data-media-id="([^"]+)"[^>]+data-media-type="image"[^>]*>.*?<\/div>/g,
      (match, mediaId) => `[IMAGE:${mediaId}]`
    );
    
    // Конвертируем видео обратно в плейсхолдеры
    content = content.replace(
      /<video[^>]+data-media-id="([^"]+)"[^>]*>.*?<\/video>/g,
      (match, mediaId) => `[VIDEO:${mediaId}]`
    );
    
    content = content.replace(
      /<div[^>]+data-media-id="([^"]+)"[^>]+data-media-type="video"[^>]*>.*?<\/div>/g,
      (match, mediaId) => `[VIDEO:${mediaId}]`
    );
    
    return content;
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  const restoreSelection = (range: Range | null) => {
    if (range) {
      try {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (e) {
        // Игнорируем ошибки восстановления
      }
    }
  };

  const handleEditableInput = useCallback((eventOrImmediate?: React.FormEvent<HTMLDivElement> | boolean) => {
    if (editableRef.current && !isUpdatingRef.current) {
      const html = editableRef.current.innerHTML;
      const converted = convertHTMLToPlaceholders(html);
      
      // Только обновляем если контент действительно изменился
      if (converted !== value) {
        onChange(converted);
      }
    }
  }, [onChange, value]);

  // Инициализация контента только один раз при монтировании
  useEffect(() => {
    if (editableRef.current && !isUpdatingRef.current) {
      const rendered = renderEditableContent(value);
      if (rendered) {
        editableRef.current.innerHTML = rendered;
      } else if (!value) {
        editableRef.current.innerHTML = `<p class="text-gray-400 italic">${placeholder}</p>`;
      }
    }
  }, []); // Только при монтировании

  // Обновление при изменении value извне (например, из кода)
  useEffect(() => {
    if (editableRef.current && !isUpdatingRef.current && !document.activeElement?.isSameNode(editableRef.current)) {
      const currentConverted = convertHTMLToPlaceholders(editableRef.current.innerHTML);
      if (currentConverted !== value) {
        const rendered = renderEditableContent(value);
        if (rendered) {
          isUpdatingRef.current = true;
          editableRef.current.innerHTML = rendered;
          isUpdatingRef.current = false;
        }
      }
    }
  }, [value, uploadedImages, libraryMedia]);

  const execCommand = (command: string, value?: string) => {
    if (!editableRef.current) return;
    
    editableRef.current.focus();
    document.execCommand(command, false, value);
    
    // Принудительно обновляем состояние после команды
    setTimeout(() => {
      handleEditableInput();
    }, 10);
  };

  const formatBlock = (tag: string) => {
    if (!editableRef.current) return;
    
    editableRef.current.focus();
    document.execCommand('formatBlock', false, `<${tag}>`);
    
    setTimeout(() => {
      handleEditableInput();
    }, 10);
  };

  const insertList = () => {
    if (!editableRef.current) return;
    
    editableRef.current.focus();
    document.execCommand('insertUnorderedList', false);
    
    setTimeout(() => {
      handleEditableInput();
    }, 10);
  };

  const applyColor = (color: string) => {
    if (!editableRef.current) return;
    
    editableRef.current.focus();
    document.execCommand('foreColor', false, color);
    setShowColorPicker(false);
    
    setTimeout(() => {
      handleEditableInput();
    }, 10);
  };

  const insertSpacing = () => {
    if (!editableRef.current) return;
    
    editableRef.current.focus();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Перемещаем курсор в конец выделения (если есть выделение)
      range.collapse(false);
      
      // Вычисляем количество переносов строк (1rem ≈ 1.5 строки)
      const lineCount = Math.max(1, Math.round(parseFloat(spacingValue) * 1.5));
      
      // Вставляем переносы строк
      for (let i = 0; i < lineCount; i++) {
        const br = document.createElement('br');
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
      }
      
      // Курсор остается после вставленных переносов
      selection.removeAllRanges();
      selection.addRange(range);
      
      setTimeout(() => {
        handleEditableInput();
      }, 10);
    }
    
    setShowSpacingModal(false);
    setSpacingValue("1");
  };

  const insertAtCursor = (text: string) => {
    if (codeMode && textareaRef.current) {
      // Режим кода
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + text + value.substring(end);
      onChange(newValue);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      });
    } else if (editableRef.current) {
      // Визуальный режим
      editableRef.current.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        setTimeout(() => {
          handleEditableInput();
        }, 10);
      }
    }
  };

  const handleMediaUpload = async (file: File, mediaType: "image" | "video") => {
    setUploading(true);
    setUploadError(null);

    try {
      const validTypes = mediaType === "image" 
        ? ["image/jpeg", "image/png", "image/gif", "image/webp"]
        : ["video/mp4", "video/webm", "video/ogg"];

      if (!validTypes.includes(file.type)) {
        throw new Error(`Пожалуйста, выберите ${mediaType === "image" ? "изображение" : "видео"}`);
      }

      const maxSize = mediaType === "image" ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`Размер файла не должен превышать ${mediaType === "image" ? "10MB" : "100MB"}`);
      }

      const response = await s3Api.uploadMedia(
        file,
        mediaType,
        courseId,
        lessonId,
        file.name
      );

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

      console.log(`${mediaType} uploaded successfully:`, media.id);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(
        error.response?.data?.detail ||
          error.message ||
          "Не удалось загрузить файл"
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

  const countMedia = () => {
    const images = (value.match(/\[IMAGE:[^\]]+\]/g) || []).length;
    const videos = (value.match(/\[VIDEO:[^\]]+\]/g) || []).length;
    return { images, videos };
  };

  const mediaCount = countMedia();

  return (
    <div className="space-y-2 sm:space-y-3">
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
              onClick={() => codeMode ? null : execCommand('bold')}
              disabled={codeMode}
              title="Жирный"
              className="h-8 w-8 p-0"
            >
              <Bold className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => codeMode ? null : execCommand('italic')}
              disabled={codeMode}
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
                onClick={() => codeMode ? null : formatBlock('h1')}
                disabled={codeMode}
                title="Заголовок 1"
                className="h-8 w-8 p-0"
              >
                <Heading1 className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => codeMode ? null : formatBlock('h2')}
                disabled={codeMode}
                title="Заголовок 2"
                className="h-8 w-8 p-0"
              >
                <Heading2 className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => codeMode ? null : formatBlock('h3')}
                disabled={codeMode}
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
              onClick={() => codeMode ? null : insertList()}
              disabled={codeMode}
              title="Список"
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-gray-300 mx-1" />

            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => codeMode ? null : setShowColorPicker(!showColorPicker)}
                disabled={codeMode}
                title="Цвет текста"
                className="h-8 w-8 p-0"
              >
                <Palette className="w-4 h-4" />
              </Button>

              {showColorPicker && !codeMode && (
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
              onClick={() => codeMode ? null : setShowSpacingModal(true)}
              disabled={codeMode}
              title="Отступ"
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
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleMediaUpload(file, "image");
              }}
              className="hidden"
            />

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleMediaUpload(file, "video");
              }}
              className="hidden"
            />

            <div className="h-6 w-px bg-gray-300 mx-1" />

            <Button
              type="button"
              variant={codeMode ? "default" : "outline"}
              size="sm"
              onClick={() => setCodeMode(!codeMode)}
              className="h-8 px-2 sm:px-3"
            >
              {codeMode ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1 text-xs">Визуал</span>
                </>
              ) : (
                <>
                  <Code className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1 text-xs">Код</span>
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

      {codeMode ? (
        <textarea
          key="code-mode"
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-xs sm:text-sm focus:outline-none focus:border-blue-500 resize-y min-h-[200px] sm:min-h-[300px]"
        />
      ) : (
        <Card key="visual-mode" className="border-2">
          <CardContent className="p-3 sm:p-4">
            <style dangerouslySetInnerHTML={{
              __html: `
                [contenteditable] h1 {
                  font-size: 2em;
                  font-weight: bold;
                  margin-top: 0.67em;
                  margin-bottom: 0.67em;
                }
                [contenteditable] h2 {
                  font-size: 1.5em;
                  font-weight: bold;
                  margin-top: 0.83em;
                  margin-bottom: 0.83em;
                }
                [contenteditable] h3 {
                  font-size: 1.17em;
                  font-weight: bold;
                  margin-top: 1em;
                  margin-bottom: 1em;
                }
                [contenteditable] ul {
                  list-style-type: disc;
                  margin-top: 1em;
                  margin-bottom: 1em;
                  padding-left: 40px;
                }
                [contenteditable] ol {
                  list-style-type: decimal;
                  margin-top: 1em;
                  margin-bottom: 1em;
                  padding-left: 40px;
                }
                [contenteditable] li {
                  display: list-item;
                  margin-bottom: 0.5em;
                }
                [contenteditable] p {
                  margin-top: 0.5em;
                  margin-bottom: 0.5em;
                }
                [contenteditable] strong {
                  font-weight: bold;
                }
                [contenteditable] em {
                  font-style: italic;
                }
              `
            }} />
            <div
              ref={editableRef}
              contentEditable
              onInput={handleEditableInput}
              className="w-full min-h-[200px] sm:min-h-[300px] focus:outline-none"
              style={{
                minHeight: `${rows * 1.5}rem`,
                lineHeight: '1.6',
              }}
              suppressContentEditableWarning
            />
          </CardContent>
        </Card>
      )}

      {showSpacingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Добавить отступ</h3>
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
                    onClick={insertSpacing}
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
          <strong>Режимы:</strong> Визуальный режим - форматирование в реальном времени, Код - HTML редактирование
        </p>
        <p>
          <strong>Форматирование:</strong> Выделите текст и используйте кнопки форматирования
        </p>
        <p>
          <strong>Медиа:</strong> Вставка изображений и видео с автоматическим превью
        </p>
      </div>
    </div>
  );
};

export default ContentEditor;