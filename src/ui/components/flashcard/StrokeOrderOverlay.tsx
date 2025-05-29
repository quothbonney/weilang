import React from 'react';
import { SvgUri } from 'react-native-svg';
import { STROKE_ORDER_BASE_URL } from '../../../../env';

interface StrokeOrderOverlayProps {
  character: string;
}

export const StrokeOrderOverlay: React.FC<StrokeOrderOverlayProps> = ({ character }) => {
  const uri = `${STROKE_ORDER_BASE_URL}/${encodeURIComponent(character)}.svg`;
  
  const overlayStyle = {
    position: 'absolute' as const,
    left: 0,
    top: 0,
  };
  
  return <SvgUri uri={uri} width="100%" height="100%" style={overlayStyle} />;
};
