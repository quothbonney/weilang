import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlertCircle } from "lucide-react-native";

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
      return (
        <View className="flex-1 justify-center items-center p-6 bg-gray-50">
          <View className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md">
            <View className="items-center mb-6">
              <AlertCircle size={56} color="#ef4444" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
              Something went wrong
            </Text>
            <Text className="text-gray-600 text-center mb-6 leading-relaxed">
              We encountered an error while loading the word profile. Please try again.
            </Text>
            <TouchableOpacity
              className="bg-blue-600 py-3 px-6 rounded-xl"
              onPress={this.handleReset}
            >
              <Text className="text-white font-semibold text-center">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
} 