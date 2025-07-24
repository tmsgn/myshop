import React from "react";

interface HeadingProps {
  title: string;
  description?: string;
}

export const Heading: React.FC<HeadingProps> = ({ title, description }) => {
  return (
    <div className="mb-4">
      <h2 className="md:text-3xl text-lg font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      )}
    </div>
  );
};
