import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, TouchableOpacity, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { StrokeOrderOverlay } from './StrokeOrderOverlay';

interface HandwritingInputProps {
  onComplete?: () => void;
  character?: string;
}

interface Point { x: number; y: number; }

export const HandwritingInput: React.FC<HandwritingInputProps> = ({ onComplete, character }) => {
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

const styles = StyleSheet.create({
  canvasContainer: {
    width: 300,
    height: 300,
    position: 'relative',
    marginBottom: 8,
  },
  canvas: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: 'white'
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 16,
  },
  controlButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  controlText: {
    color: '#374151',
    fontWeight: '600'
  }
});
