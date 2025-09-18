import { useState } from 'react';
import type { ChangeEvent } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState<string>(
    "I have uploaded a sticker image and I want a cool product design of it where a hand is holding it and background which supports the image and makes it pop. Can you add some blur outdoor lighting like holocast or something and don't change the original image. MAKE IT HYPER REALISTIC AND HYPER DETAILED. DO NOT CHANGE THE ORIGINAL STICKER IMAGE, IT'S THE MVP."
  );
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [inputImageUrl, setInputImageUrl] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInputImage(e.target.files[0]);
      setOutputImage(null);
      setError(null);
      setInputImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      setInputImage(files[0]);
      setOutputImage(null);
      setError(null);
      setInputImageUrl(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = async () => {
    if (!inputImage) return;
    setLoading(true);
    setError(null);
    setOutputImage(null);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.readAsDataURL(inputImage);
      reader.onload = async () => {
        const base64Image = reader.result as string;
        // Read API key from environment variable
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          setError('API key is not set. Please add VITE_GEMINI_API_KEY to your .env file.');
          setLoading(false);
          return;
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;
        const requestBody = {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: inputImage.type,
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
          const errData = await response.json().catch(() => ({}));
          setError(errData?.error?.message || 'API request failed');
          setLoading(false);
          return;
        }
        const data = await response.json();
        // Find the first part with inlineData (the image)
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find((p: any) => p.inlineData && p.inlineData.data);
        if (imagePart && imagePart.inlineData.data) {
          setOutputImage(`data:image/png;base64,${imagePart.inlineData.data}`);
        } else {
          setError('No image returned from API.');
        }
        setLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to read image file.');
        setLoading(false);
      };
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Sticker Mockup Creator</h1>

      {/* Two column layout */}
      <div className="input-section">
        <div className="column">
          <h3>Enter Prompt</h3>
          <textarea
            value={prompt}
            onChange={handlePromptChange}
            rows={8}
            className="prompt-textarea"
            placeholder="Enter your prompt here..."
          />
        </div>

        <div className="column">
          <h3>Upload Image</h3>
          {inputImageUrl ? (
            <div className="preview-container">
              <div className="image-wrapper">
                <img src={inputImageUrl} alt="Preview" className="preview-image" />
                <button
                  className="remove-image-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setInputImage(null);
                    setInputImageUrl(null);
                    setOutputImage(null);
                    setError(null);
                  }}
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            </div>) : (
            <div className="upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="image-upload"
                className="file-input"
              />
              <label
                htmlFor="image-upload"
                className={`upload-label ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="upload-placeholder">
                  <p>Click to upload an image</p>
                  <p className="upload-hint">or drag and drop</p>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Generate button */}
      <div className="generate-section">
        <button
          onClick={handleSubmit}
          disabled={!inputImage || loading}
          className="generate-button"
        >
          {loading ? 'Processing...' : 'Generate Mockup'}
        </button>
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Result section */}
      {outputImage && (
        <div className="result-section">
          <h3>Generated Result</h3>
          <div className="result-container">
            <img src={outputImage} alt="Generated Result" className="result-image" />
            <div className="download-section">
              <a href={outputImage} download="sticker-mockup.png">
                <button className="download-button">Download Image</button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
