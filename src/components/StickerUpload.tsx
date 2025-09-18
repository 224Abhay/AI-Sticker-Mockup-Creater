import React, { useCallback, useState } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickerUploadProps {
  onStickerSelect: (file: File) => void;
  selectedSticker: File | null;
  onStickerRemove: () => void;
}

export const StickerUpload: React.FC<StickerUploadProps> = ({
  onStickerSelect,
  selectedSticker,
  onStickerRemove,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find(file => file.type.startsWith('image/'));
      
      if (imageFile) {
        onStickerSelect(imageFile);
      }
    },
    [onStickerSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        onStickerSelect(file);
      }
    },
    [onStickerSelect]
  );

  if (selectedSticker) {
    return (
      <div className="relative glass-card rounded-lg group">
        <img
          src={URL.createObjectURL(selectedSticker)}
          alt="Selected sticker"
          className="w-full h-48 object-contain rounded-lg"
        />
        <button
          onClick={onStickerRemove}
          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {selectedSticker.name}
        </p>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "glass-card border-2 border-dashed border-white/20 rounded-lg text-center transition-all duration-300 cursor-pointer hover:border-accent/50 h-[20vh] flex items-center justify-center",
        isDragOver && "border-accent bg-accent/10 scale-105"
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        id="sticker-upload"
      />
      <label htmlFor="sticker-upload" className="cursor-pointer w-full">
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            "p-4 rounded-full transition-all duration-300",
            isDragOver ? "bg-accent/20 text-accent" : "bg-white/10 text-muted-foreground"
          )}>
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Drop your sticker here
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse files
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Image className="w-4 h-4" />
            <span>PNG, JPG, SVG supported</span>
          </div>
        </div>
      </label>
    </div>
  );
};