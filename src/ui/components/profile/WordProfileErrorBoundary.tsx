import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Card, Text, Button } from '../themed';
import { useTheme } from '../../theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WordProfileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WordProfile Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return <WordProfileError onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

const WordProfileError: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.layout.lg,
        backgroundColor: theme.colors.background.primary,
      }}
    >
      <Card
        variant="elevated"
        style={{ padding: theme.layout.xl, alignItems: 'center', maxWidth: 400 }}
      >
        <AlertCircle
          size={theme.dimensions.iconSize.lg * 2}
          color={theme.colors.status.error}
          style={{ marginBottom: theme.layout.lg }}
        />
        <Text
          variant="h4"
          style={{ textAlign: 'center', marginBottom: theme.layout.md }}
        >
          Something went wrong
        </Text>
        <Text
          color="secondary"
          style={{ textAlign: 'center', marginBottom: theme.layout.lg }}
        >
          We encountered an error while loading the word profile. Please try
          again.
        </Text>
        <Button title="Try Again" onPress={onReset} />
      </Card>
    </View>
  );
};

export default WordProfileErrorBoundary;
