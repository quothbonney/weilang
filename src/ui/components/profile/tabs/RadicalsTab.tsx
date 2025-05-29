import React from "react";
import { View, Text } from "react-native";
import { useProfileStyles } from "../../../theme";

export function RadicalsTab() {
  const styles = useProfileStyles();
  
  return (
    <View style={[styles.tabContent, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
      <View style={styles.emptyStateCard}>
        <Text style={styles.tabSectionTitle}>Radical Analysis</Text>
        <Text style={[styles.emptyStateText, { marginTop: 16 }]}>Radical analysis coming soon!</Text>
      </View>
    </View>
  );
} 