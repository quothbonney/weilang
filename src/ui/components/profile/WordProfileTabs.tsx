import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Animated } from "react-native";
import { useWordProfile } from "./WordProfileProvider";
import { WordProfileHeader } from "./WordProfileHeader";
import { BreakdownTab } from "./tabs/BreakdownTab";
import { RadicalsTab } from "./tabs/RadicalsTab";
import { ExamplesTab } from "./tabs/ExamplesTab";
import { GrammarTab } from "./tabs/GrammarTab";
import { NotesTab } from "./tabs/NotesTab";

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
    <View className="flex-1 bg-gray-50">
      {/* Collapsed Header Bar - floating overlay */}
      <Animated.View 
        className="absolute top-0 left-0 right-0 z-30"
        style={{
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        }}
        pointerEvents={isHeaderCollapsed ? 'auto' : 'none'}
      >
        <WordProfileHeader isCollapsed={true} />
      </Animated.View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header - part of scroll content */}
        <WordProfileHeader isCollapsed={false} />

        {/* Tab Navigation - sticky */}
        <View className="bg-white border-b border-gray-200">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="px-6"
            contentContainerStyle={{ paddingVertical: 16 }}
          >
            <View className="flex-row space-x-2">
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-blue-600'
                      : 'bg-transparent'
                  }`}
                >
                  <Text 
                    className={`font-medium text-base ${
                      activeTab === tab.id 
                        ? 'text-white' 
                        : 'text-gray-600'
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          {/* Active tab indicator line */}
          <View className="h-1 bg-gray-100">
            <View 
              className="h-full bg-blue-600 transition-all duration-200"
              style={{ 
                width: `${100 / tabs.length}%`,
                marginLeft: `${(tabs.findIndex(tab => tab.id === activeTab) * 100) / tabs.length}%`
              }}
            />
          </View>
        </View>

        {/* Tab Content */}
        <ActiveComponent />
      </ScrollView>
    </View>
  );
} 