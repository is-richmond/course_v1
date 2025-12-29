// admin/src/components/ContentEditor.tsx
"use client";

import React, { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Image as ImageIcon,
  Palette
} from 'lucide-react';

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter text...",
  label,
  rows = 8
}) => {
  const [isVisualMode, setIsVisualMode] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (command: string, val: string | null = null) => {
    document.execCommand(command, false, val || undefined);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const changeTextColor = () => {
    const color = prompt('Enter color (hex, rgb, or name):');
    if (color) {
      execCommand('foreColor', color);
    }
  };

  const changeBackgroundColor = () => {
    const color = prompt('Enter background color (hex, rgb, or name):');
    if (color) {
      execCommand('backColor', color);
    }
  };

  const insertImage = () => {
    imageInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = `<img src="${event.target?.result}" style="max-width: 100%; height: auto;" />`;
        document.execCommand('insertHTML', false, img);
        updateContent();
      };
      reader.readAsDataURL(file);
    }
  };

  const formatBlock = (tag: string) => {
    execCommand('formatBlock', tag);
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
    { icon: Code, command: 'code', title: 'Code' },
  ];

  const headingButtons = [
    { icon: Heading1, tag: 'h1', title: 'Heading 1' },
    { icon: Heading2, tag: 'h2', title: 'Heading 2' },
    { icon: Heading3, tag: 'h3', title: 'Heading 3' },
  ];

  const alignButtons = [
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  ];

  const listButtons = [
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
  ];

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      {/* Mode Toggle */}
      <div className="flex space-x-2 mb-2">
        <Button
          type="button"
          variant={isVisualMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsVisualMode(true)}
        >
          Visual
        </Button>
        <Button
          type="button"
          variant={!isVisualMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsVisualMode(false)}
        >
          HTML
        </Button>
      </div>

      {isVisualMode ? (
        <div className="border rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
            {/* Text Formatting */}
            <div className="flex gap-1 border-r pr-2">
              {toolbarButtons.map(({ icon: Icon, command, title }) => (
                <Button
                  key={command}
                  type="button"
                  variant="ghost"
                  size="sm"
                  title={title}
                  onClick={() => execCommand(command)}
                  className="h-8 w-8 p-0"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            {/* Headings */}
            <div className="flex gap-1 border-r pr-2">
              {headingButtons.map(({ icon: Icon, tag, title }) => (
                <Button
                  key={tag}
                  type="button"
                  variant="ghost"
                  size="sm"
                  title={title}
                  onClick={() => formatBlock(tag)}
                  className="h-8 w-8 p-0"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            {/* Alignment */}
            <div className="flex gap-1 border-r pr-2">
              {alignButtons.map(({ icon: Icon, command, title }) => (
                <Button
                  key={command}
                  type="button"
                  variant="ghost"
                  size="sm"
                  title={title}
                  onClick={() => execCommand(command)}
                  className="h-8 w-8 p-0"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            {/* Lists */}
            <div className="flex gap-1 border-r pr-2">
              {listButtons.map(({ icon: Icon, command, value, title }) => (
                <Button
                  key={command + (value || '')}
                  type="button"
                  variant="ghost"
                  size="sm"
                  title={title}
                  onClick={() => value ? formatBlock(value) : execCommand(command)}
                  className="h-8 w-8 p-0"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            {/* Colors */}
            <div className="flex gap-1 border-r pr-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Text Color"
                onClick={changeTextColor}
                className="h-8 w-8 p-0"
              >
                <Palette className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Background Color"
                onClick={changeBackgroundColor}
                className="h-8 w-8 p-0"
              >
                <div className="h-4 w-4 border border-gray-400 rounded" style={{background: 'linear-gradient(to bottom, transparent 50%, yellow 50%)'}}></div>
              </Button>
            </div>

            {/* Media */}
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Insert Link"
                onClick={insertLink}
                className="h-8 w-8 p-0"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Insert Image"
                onClick={insertImage}
                className="h-8 w-8 p-0"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Hidden Image Input */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Editor Area */}
          <div
            ref={editorRef}
            contentEditable
            onInput={updateContent}
            onPaste={handlePaste}
            className="p-4 min-h-[200px] focus:outline-none prose prose-sm max-w-none"
            style={{
              minHeight: `${rows * 1.5}rem`,
              maxHeight: '400px',
              overflowY: 'auto'
            }}
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: value || '' }}
          />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
      )}

      <style jsx global>{`
        .prose {
          color: #374151;
        }
        .prose h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 0.5rem 0;
        }
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }
        .prose h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }
        .prose p {
          margin: 0.5rem 0;
        }
        .prose ul, .prose ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #6b7280;
          font-style: italic;
        }
        .prose code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: monospace;
        }
        .prose a {
          color: #2563eb;
          text-decoration: underline;
        }
        .prose strong {
          font-weight: 600;
        }
        .prose em {
          font-style: italic;
        }
        .prose u {
          text-decoration: underline;
        }
        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default ContentEditor