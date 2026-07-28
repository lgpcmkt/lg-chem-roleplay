import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 25,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);

    if (!text) {
      setIsTyping(false);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={className}>
      {prefix}
      {displayedText}
      {isTyping && (
        <span className="inline-block w-1.5 h-4 bg-[#3182F6] ml-0.5 animate-pulse align-middle" />
      )}
      {suffix}
    </span>
  );
};
