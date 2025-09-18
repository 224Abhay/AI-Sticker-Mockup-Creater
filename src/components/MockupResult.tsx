import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MockupResultProps {
  mockupUrl: string | null;
  isLoading: boolean;
  onRegenerate: () => void;
}

export const MockupResult: React.FC<MockupResultProps> = ({
  mockupUrl,
  isLoading,
  onRegenerate,
}) => {
  const handleDownload = () => {
    if (mockupUrl) {
      const link = document.createElement('a');
      link.href = mockupUrl;
      link.download = 'sticker-mockup.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8 rounded-lg text-center">
        <div className="flex flex-col items-center space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Regenerating your mockup...
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              AI is generating your perfect sticker mockup
            </p>
          </div>
          <div className="w-full max-w-xs bg-white/10 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent ai-loading"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!mockupUrl) {
    return (
      <div className="glass-card p-8 rounded-lg text-center border-dashed border-white/20">
        <div className="flex flex-col items-center space-y-4 text-muted-foreground">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
            <RefreshCw className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-medium">
              Ready to create magic?
            </h3>
            <p className="text-sm mt-1">
              Upload a sticker and enter a prompt to generate your mockup
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group inline-block">
      <img
        src={mockupUrl}
        alt="Generated sticker mockup"
        className="max-w-full max-h-[60vh] object-contain rounded-lg"
      />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-3">
        <Button variant="glass" size="sm" onClick={onRegenerate}>
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </Button>
        <Button variant="ai" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </div>
  );
};