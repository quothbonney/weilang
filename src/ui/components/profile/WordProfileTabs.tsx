import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Animated } from "react-native";
import { useWordProfile } from "./WordProfileProvider";
import { WordProfileHeader } from "./WordProfileHeader";
import { BreakdownTab } from "./tabs/BreakdownTab";
import { RadicalsTab } from "./tabs/RadicalsTab";
import { ExamplesTab } from "./tabs/ExamplesTab";
import { GrammarTab } from "./tabs/GrammarTab";
import { NotesTab } from "./tabs/NotesTab";
import { useProfileStyles, useTheme } from "../../theme";

type TabType = 'breakdown' | 'radicals' | 'examples' | 'grammar' | 'notes';

interface Tab {
  id: TabType;
  label: string;
  component: React.ComponentType;
}

const tabs: Tab[] = [
  { id: 'breakdown', label: 'Breakdown', component: BreakdownTab },
  { id: 'radicals', label: 'Radicals', component: RadicalsTab },
  { id: 'examples', label: 'Examples', component: ExamplesTab },
  { id: 'grammar', label: 'Grammar', component: GrammarTab },
  { id: 'notes', label: 'Notes', component: NotesTab },
];

const SCROLL_THRESHOLD = 30; // pixels to scroll before collapsing

export function WordProfileTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('breakdown');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { profile } = useWordProfile();
  const styles = useProfileStyles();
  const { theme } = useTheme();

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || BreakdownTab;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const scrollOffset = event.nativeEvent.contentOffset.y;
        const shouldCollapse = scrollOffset > SCROLL_THRESHOLD;
        
        if (shouldCollapse !== isHeaderCollapsed) {
          setIsHeaderCollapsed(shouldCollapse);
        }
      },
    }
  );

  // Animated opacity for smooth header transition
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD, SCROLL_THRESHOLD + 20],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD, SCROLL_THRESHOLD + 20],
    outputRange: [-60, -60, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Collapsed Header Bar - floating overlay */}
      <Animated.View 
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          }
        ]}
        pointerEvents={isHeaderCollapsed ? 'auto' : 'none'}
      >
        <WordProfileHeader isCollapsed={true} />
      </Animated.View>

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: theme.layout.xl * 2 }}
      >
        {/* Header - part of scroll content */}
        <WordProfileHeader isCollapsed={false} />

        {/* Tab Navigation - sticky */}
        <View style={styles.tabContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabScrollView}
            contentContainerStyle={{ paddingVertical: theme.layout.lg }}
          >
            <View style={styles.tabRow}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={[
                    styles.tabButton,
                    activeTab === tab.id ? styles.tabButtonActive : styles.tabButtonInactive
                  ]}
                >
                  <Text 
                    style={[
                      styles.tabText,
                      activeTab === tab.id ? styles.tabTextActive : styles.tabTextInactive
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          {/* Active tab indicator line */}
          <View style={styles.tabIndicatorContainer}>
            <View 
              style={[
                styles.tabIndicator,
                { 
                  width: `${100 / tabs.length}%`,
                  marginLeft: `${(tabs.findIndex(tab => tab.id === activeTab) * 100) / tabs.length}%`
                }
              ]}
            />
          </View>
        </View>

        {/* Tab Content */}
        <ActiveComponent />
      </ScrollView>
    </View>
  );
} 