import React from "react";

export interface EditableImageProps {
  src: string;
  alt: string;
  storageKey?: string;
  label?: string;
  className?: string;
  containerClassName?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  overlayPosition?: "center" | "top-right";
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  onImageClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  className = "",
  containerClassName = "",
  objectFit,
  objectPosition,
  loading,
  fetchPriority,
  onImageClick,
  children,
}) => {
  const imageStyle: React.CSSProperties = {
    objectFit: objectFit || "cover",
    objectPosition: objectPosition || "center",
  };

  return (
    <div className={`relative ${containerClassName}`}>
      {children ? (
        children
      ) : (
        <img
          src={src}
          alt={alt}
          className={className}
          style={imageStyle}
          loading={loading}
          fetchPriority={fetchPriority}
          onClick={onImageClick}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
};
