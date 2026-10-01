import React, { useState, useEffect, useId } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
import { getCustomImage, setCustomImage, removeCustomImage, optimizeImage } from '../utils/imageStorage';
import { useEditMode } from '../context/EditModeContext';

export interface EditableImageProps {
  src: string;
  alt: string;
  storageKey?: string;
  label?: string;
  className?: string;
  containerClassName?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  overlayPosition?: 'center' | 'top-right';
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  onImageClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  storageKey,
  label,
  className = '',
  containerClassName = '',
  objectFit,
  objectPosition,
  overlayPosition = 'center',
  loading,
  fetchPriority,
  onImageClick,
  children,
}) => {
  const { isEditMode } = useEditMode();
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const uniqueInputId = useId();

  // Load custom image from memory / storage on mount and when key changes
  useEffect(() => {
    let isMounted = true;

    if (storageKey) {
      getCustomImage(storageKey)
        .then((customData) => {
          if (!isMounted) return;
          if (customData) {
            setCurrentSrc(customData);
            setIsCustom(true);
          } else {
            setCurrentSrc(src);
            setIsCustom(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setCurrentSrc(src);
            setIsCustom(false);
          }
        });
    } else {
      setCurrentSrc(src);
      setIsCustom(false);
    }

    return () => {
      isMounted = false;
    };
  }, [storageKey, src]);

  // Synchronize across components when a storage key updates
  useEffect(() => {
    if (!storageKey) return;

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; dataUrl: string | null }>;
      if (customEvent.detail && customEvent.detail.key === storageKey) {
        if (customEvent.detail.dataUrl) {
          setCurrentSrc(customEvent.detail.dataUrl);
          setIsCustom(true);
        } else {
          setCurrentSrc(src);
          setIsCustom(false);
        }
      }
    };

    window.addEventListener('makhe_image_updated', handleUpdate);
    return () => window.removeEventListener('makhe_image_updated', handleUpdate);
  }, [storageKey, src]);

  // Handle local file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storageKey) return;

    setIsProcessing(true);

    try {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const rawDataUrl = event.target?.result as string;
          if (!rawDataUrl) return;

          // Resize/compress to fit browser storage gracefully
          const optimizedDataUrl = await optimizeImage(rawDataUrl, 1600, 1600, 0.88);

          // Immediately update state
          setCurrentSrc(optimizedDataUrl);
          setIsCustom(true);

          // Persist in background
          await setCustomImage(storageKey, optimizedDataUrl);
        } catch (err) {
          console.error('Error optimizing and storing image:', err);
        } finally {
          setIsProcessing(false);
          // Reset file input value after processing is finished
          if (e.target) {
            e.target.value = '';
          }
        }
      };

      reader.onerror = () => {
        console.error('Failed reading file');
        setIsProcessing(false);
        if (e.target) {
          e.target.value = '';
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File selection error:', err);
      setIsProcessing(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Handle resetting back to original project asset
  const handleReset = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!storageKey) return;

    await removeCustomImage(storageKey);
    setCurrentSrc(src);
    setIsCustom(false);
  };

  // Determine label for button
  const buttonLabel =
    label ||
    (storageKey?.includes('banner') || storageKey?.includes('hero')
      ? 'CHANGE BANNER IMAGE'
      : storageKey?.includes('product') || storageKey?.includes('pack')
      ? 'CHANGE PRODUCT IMAGE'
      : 'CHANGE IMAGE');

  // Determine objectFit style
  const resolvedObjectFit =
    objectFit ||
    (storageKey?.includes('pack') || storageKey?.includes('product') || storageKey?.includes('logo') || storageKey?.includes('banner') || storageKey?.includes('hero')
      ? 'contain'
      : 'cover');

  const imageStyle: React.CSSProperties = {
    objectFit: resolvedObjectFit,
    objectPosition: objectPosition || 'center',
  };

  const isRenderingChildren = Boolean(children && !isCustom);

  return (
    <div className={`relative ${containerClassName}`}>
      {isRenderingChildren ? (
        children
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          className={className}
          style={imageStyle}
          loading={loading}
          fetchPriority={fetchPriority}
          onClick={onImageClick}
          referrerPolicy="no-referrer"
          onError={() => {
            if (currentSrc !== src) {
              setCurrentSrc(src);
            }
          }}
        />
      )}

      {/* Edit Images Overlay (Rendered ONLY when EDIT IMAGES is ON) */}
      {isEditMode && storageKey && (
        <div
          className={
            overlayPosition === 'top-right'
              ? 'absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex flex-wrap items-center gap-2 pointer-events-auto'
              : 'absolute inset-0 z-30 flex flex-wrap items-center justify-center gap-2 p-2 bg-black/45 backdrop-blur-[1px] rounded-[inherit] transition-opacity duration-200 pointer-events-auto'
          }
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Native Label with embedded file input for 100% reliable trigger in all browsers */}
          <label
            htmlFor={uniqueInputId}
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-[#142B1A] text-[#E5C778] border border-[#C59B27] hover:bg-[#234A30] text-[10px] sm:text-xs font-bold tracking-wider uppercase font-sans-brand shadow-xl cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 select-none"
            title={buttonLabel}
          >
            <Camera size={13} className="text-[#E5C778] shrink-0 pointer-events-none" />
            <span className="pointer-events-none">
              {isProcessing ? 'UPDATING...' : buttonLabel}
            </span>
            <input
              id={uniqueInputId}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/*"
              className="sr-only"
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: 0,
              }}
              onChange={handleFileChange}
              onClick={(e) => e.stopPropagation()}
            />
          </label>

          {/* Reset button to restore project default asset */}
          {isCustom && (
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#2B1414]/90 text-[#FCA5A5] border border-red-500/60 hover:bg-red-900/90 hover:text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase font-sans-brand shadow-xl cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1 select-none"
              title="Reset to original image"
            >
              <RotateCcw size={11} className="shrink-0 pointer-events-none" />
              <span className="pointer-events-none">RESET</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
