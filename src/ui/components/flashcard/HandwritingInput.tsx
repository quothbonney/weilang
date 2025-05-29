import React, { useRef, useState } from 'react';
import { View, PanResponder, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import Svg, { Path } from 'react-native-svg';

import { StrokeOrderOverlay } from './StrokeOrderOverlay';

interface HandwritingInputProps {
  onComplete?: () => void;
  character?: string;
}

interface Point { x: number; y: number; }

export const HandwritingInput: React.FC<HandwritingInputProps> = ({ onComplete, character }) => {
  const { theme } = useTheme();
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentStroke([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: evt => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentStroke(prev => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        setStrokes(prev => [...prev, currentStroke]);
        setCurrentStroke([]);
      },
      onPanResponderTerminate: () => {
        setStrokes(prev => [...prev, currentStroke]);
        setCurrentStroke([]);
      }
    })
  ).current;

  const pathData = (points: Point[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  const clear = () => {
    setStrokes([]);
    setCurrentStroke([]);
  };

  const styles = {
    canvasContainer: {
      width: 300,
      height: 300,
      position: 'relative' as const,
      marginBottom: theme.layout.sm,
    },
    canvas: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface.primary,
    },
    controls: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      marginTop: theme.layout.sm,
      gap: theme.layout.md,
    },
    controlButton: {
      backgroundColor: theme.colors.surface.secondary,
      paddingHorizontal: theme.layout.lg,
      paddingVertical: theme.layout.sm,
      borderRadius: theme.borderRadius.md,
    },
    controlText: {
      color: theme.colors.text.primary,
      fontWeight: '600' as const,
    },
  } as const;

  return (
    <View>
      <View style={styles.canvasContainer}>
        {character && <StrokeOrderOverlay character={character} />}
        <View style={styles.canvas} {...panResponder.panHandlers}>
          <Svg style={StyleSheet.absoluteFill}>
            {strokes.map((stroke, idx) => (
              <Path key={idx} d={pathData(stroke)} stroke="black" strokeWidth={4} fill="none" strokeLinecap="round" />
            ))}
            {currentStroke.length > 0 && (
              <Path d={pathData(currentStroke)} stroke="black" strokeWidth={4} fill="none" strokeLinecap="round" />
            )}
          </Svg>
        </View>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={clear}>
          <Text style={styles.controlText}>Clear</Text>
        </TouchableOpacity>
        {onComplete && (
          <TouchableOpacity style={styles.controlButton} onPress={onComplete}>
            <Text style={styles.controlText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

