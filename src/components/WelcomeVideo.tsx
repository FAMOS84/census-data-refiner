import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const WelcomeVideo = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const slides = [
    {
      title: "Upload Your Census File",
      description: "Simply drag and drop your LMG census file or click to browse"
    },
    {
      title: "Automatic Processing", 
      description: "Our AI analyzes and formats your data automatically"
    },
    {
      title: "Download Clean Data",
      description: "Get your formatted, validated census data ready for use"
    },
    {
      title: "Secure & Fast",
      description: "All processing happens securely with enterprise-grade protection"
    }
  ];

  const script = "Transform your census data in seconds. Upload your LMG census file, let our AI automatically format and validate the data, then download your clean, ready-to-use results. Secure, fast, and effortless data processing.";

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      setIsLoading(true);
      
      // Generate images
      const imagePrompts = [
        "Professional interface showing file upload area with census data spreadsheet, clean modern UI design, blue and white color scheme",
        "AI processing visualization with gears and data flowing through pipelines, automated data transformation, tech illustration",
        "Clean formatted spreadsheet with organized data columns, download button, completed data processing interface",
        "Security shield icons with lock symbols, enterprise data protection, secure cloud processing visualization"
      ];

      const { data: imageData } = await supabase.functions.invoke('generate-welcome-images', {
        body: { prompts: imagePrompts }
      });

      if (imageData?.images) {
        const imageUrls = imageData.images.map((img: string) => `data:image/png;base64,${img}`);
        setImages(imageUrls);
      }

      // Generate audio
      const { data: audioData } = await supabase.functions.invoke('generate-welcome-audio', {
        body: { text: script }
      });

      if (audioData?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(audioData.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      }

    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startSlideshow = () => {
    if (audioRef.current && audioUrl) {
      setIsPlaying(true);
      audioRef.current.play();
      
      // Change slides every 15 seconds (60s / 4 slides)
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 15000);
    }
  };

  const pauseSlideshow = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const handleAudioEnd = () => {
      setIsPlaying(false);
      setCurrentSlide(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleAudioEnd);
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleAudioEnd);
        }
      };
    }
  }, [audioUrl]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 mb-6">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Generating welcome video...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 mb-6">
      <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4 relative">
        {images[currentSlide] ? (
          <img 
            src={images[currentSlide]} 
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
            <div className="text-center p-4">
              <h3 className="font-semibold text-lg mb-2">{slides[currentSlide].title}</h3>
              <p className="text-sm text-muted-foreground">{slides[currentSlide].description}</p>
            </div>
          </div>
        )}
        
        {/* Slide indicators */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Button
            onClick={isPlaying ? pauseSlideshow : startSlideshow}
            variant="outline"
            size="sm"
            disabled={!audioUrl}
          >
            {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {isPlaying ? 'Pause' : 'Play'} Demo
          </Button>
        </div>
        
        <Button
          onClick={toggleMute}
          variant="ghost"
          size="sm"
          disabled={!audioUrl}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          className="hidden"
        />
      )}
    </Card>
  );
};

export default WelcomeVideo;