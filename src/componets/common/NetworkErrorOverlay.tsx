import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNetworkContext } from '../../context/NetworkContext';

export default function NetworkErrorOverlay() {
  const { isOffline, retryConnection } = useNetworkContext();
  const [checking, setChecking] = useState(false);

  const handleRefresh = useCallback(async () => {
    setChecking(true);
    await retryConnection();
    setChecking(false);
  }, [retryConnection]);

  if (!isOffline) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Icon area */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>⚠</Text>
        </View>

        <Text style={styles.title}>Connection Problem</Text>
        <Text style={styles.message}>
          There was a problem loading. Please check your internet connection and try again.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRefresh}
          activeOpacity={0.8}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Refresh</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: '82%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  button: {
    backgroundColor: '#2DA9E9',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    minHeight: 48,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
