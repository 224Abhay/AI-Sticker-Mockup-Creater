import React, { useState, useEffect } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickerUpload } from '@/components/StickerUpload';
import { MockupResult } from '@/components/MockupResult';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SettingsDialog } from '@/components/SettingsDialog';
import { toast } from 'sonner';

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedSticker, setSelectedSticker] = useState<File | null>(null);
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Save API key to localStorage whenever it changes
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini-api-key', key);
    toast.success('API key saved successfully!');
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedSticker) {
      toast.error('Please provide both a prompt and upload a sticker');
      return;
    }

    if (!apiKey.trim()) {
      toast.error('Please configure your Gemini API key in settings');
      return;
    }

    setIsLoading(true);

    try {
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedSticker);
      });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;
      const requestBody = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: selectedSticker.type,
                  data: base64Image.split(',')[1],
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Extract the generated image from the response
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const parts = data.candidates[0].content.parts;
        const imagePart = parts.find((part: any) => part.inlineData);

        if (imagePart && imagePart.inlineData) {
          const imageData = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
          setMockupUrl(imageData);
          toast.success('Mockup generated successfully!');
        } else {
          throw new Error('No image generated in response');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate mockup. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleStickerRemove = () => {
    setSelectedSticker(null);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[90vw] mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 my-4">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-24 h-24 overflow-hidden">
              <img
                src={`${import.meta.env.PROD ? '/AI-Sticker-Mockup-Creator' : ''}/logo.png`}
                alt="Red Bull Racing Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
              AI Sticker Creator
            </h1>
          </div>

          {/* Right side - Mode Toggle and Settings */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <SettingsDialog apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
          </div>
        </div>

        {/* Header Description */}
        <div className="text-center mb-8 pt-4">
          <p className="text-xl text-muted-foreground mx-auto">
            Transform your stickers into stunning mockups with the power of artificial intelligence
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start transition-all duration-700 ease-in-out justify-center">
          {/* Input Section */}
          <div className={`space-y-6 transition-all duration-700 ease-in-out lg:max-w-2xl ${
            mockupUrl 
              ? 'w-full lg:w-1/2 ' 
              : 'w-full lg:w-2/3 mx-auto'
          }`}>
            {/* Prompt Input */}
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Wand2 className="w-5 h-5 text-accent" />
                <span>Describe your vision</span>
              </h2>
              <Textarea
                placeholder="Describe the perfect scene for your sticker... e.g., 'A cute sticker on a laptop in a cozy coffee shop with warm lighting'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mb-4"
              />
              <div className="text-xs text-muted-foreground">
                <strong>Pro tip:</strong> Be specific about the environment, lighting, and mood for best results
              </div>
            </div>

            {/* Sticker Upload */}
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span>Upload your sticker</span>
              </h2>
              <StickerUpload
                onStickerSelect={setSelectedSticker}
                selectedSticker={selectedSticker}
                onStickerRemove={handleStickerRemove}
              />
            </div>

            {/* Generate Button */}
            <Button
              variant="ai"
              size="lg"
              onClick={handleGenerate}
              disabled={!prompt.trim() || !selectedSticker || isLoading}
              className="w-full text-lg py-6"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Mockup
                </>
              )}
            </Button>
          </div>

          {/* Result Section */}
          {mockupUrl && (
            <div className="w-full lg:w-fit lg:flex-shrink-0 animate-in slide-in-from-right-5 fade-in-0 duration-700 ease-out">
              <div className="glass-card p-6 rounded-xl w-full lg:w-fit">
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span>Your AI-generated mockup</span>
                </h2>
                <MockupResult
                  mockupUrl={mockupUrl}
                  isLoading={isLoading}
                  onRegenerate={handleRegenerate}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
