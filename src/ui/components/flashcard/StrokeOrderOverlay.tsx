import React from 'react';
import { StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { STROKE_ORDER_BASE_URL } from '../../../../env';

interface StrokeOrderOverlayProps {
  character: string;
}

export const StrokeOrderOverlay: React.FC<StrokeOrderOverlayProps> = ({ character }) => {
  const uri = `${STROKE_ORDER_BASE_URL}/${encodeURIComponent(character)}.svg`;
  return <SvgUri uri={uri} width="100%" height="100%" style={styles.overlay} />;
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
