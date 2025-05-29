import React from 'react';
import { View, ViewProps, ScrollView, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface ThemedScreenProps extends Omit<ViewProps, 'style'> {
  scrollable?: boolean;
  safeArea?: boolean;
  padding?: boolean;
  style?: ViewProps['style'];
  scrollViewProps?: Omit<ScrollViewProps, 'style' | 'children'>;
}

export const Screen: React.FC<ThemedScreenProps> = ({
  scrollable = false,
  safeArea = true,
  padding = true,
  style,
  children,
  scrollViewProps,
  ...props
}) => {
  const { theme } = useTheme();

  const getScreenStyle = () => ({
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    ...(padding && { paddingHorizontal: theme.layout.screenPadding }),
  });

  const screenStyle = getScreenStyle();

  const ScreenContainer = safeArea ? SafeAreaView : View;

  if (scrollable) {
    return (
      <ScreenContainer style={[screenStyle, style]} {...props}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: theme.layout.lg,
          }}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={[screenStyle, style]} {...props}>
      {children}
    </ScreenContainer>
  );
};

export default Screen; 