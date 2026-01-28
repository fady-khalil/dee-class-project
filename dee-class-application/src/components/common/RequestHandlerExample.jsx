import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import COLORS from "../../styles/colors";
import {
  StatusHandler,
  SkeletonLoader,
  useStatusHandler,
} from "../RequestHandler";

/**
 * Example component showing how to use the RequestHandler components
 */
const RequestHandlerExample = () => {
  // Use the status handler hook
  const statusHandler = useStatusHandler();
  const [loading, setLoading] = useState(false);

  // Simulate API requests
  const simulateSuccessRequest = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      statusHandler.showSuccess("form.submit.success");
    }, 1500);
  };

  const simulateErrorRequest = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      statusHandler.showError("api.network.error");
    }, 1500);
  };

  const simulateWarningRequest = () => {
    statusHandler.showWarning("general.warning", false);
  };

  const simulateInfoRequest = () => {
    statusHandler.showInfo("general.info");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Request Handler Example</Text>

      {/* Status message display */}
      <StatusHandler
        isVisible={statusHandler.isVisible}
        status={statusHandler.status}
        message={statusHandler.message}
        autoClose={statusHandler.autoClose}
        hideStatus={statusHandler.hideStatus}
        messages={statusHandler.messages}
      />

      {/* Action buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={simulateSuccessRequest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Success Request</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.errorButton]}
          onPress={simulateErrorRequest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Error Request</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={simulateWarningRequest}
        >
          <Text style={styles.buttonText}>Warning (No Auto-Close)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={simulateInfoRequest}
        >
          <Text style={styles.buttonText}>Info Message</Text>
        </TouchableOpacity>
      </View>

      {/* Skeleton loader example */}
      <Text style={styles.subtitle}>Skeleton Loader Example:</Text>

      <SkeletonLoader isLoading={loading} style={styles.skeletonCard}>
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>Content Loaded!</Text>
          <Text style={styles.cardText}>
            This content is displayed when loading is complete.
          </Text>
        </View>
      </SkeletonLoader>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.backgroundColor,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: 24,
    marginBottom: 16,
  },
  buttonsContainer: {
    marginVertical: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  successButton: {
    backgroundColor: "#2ECC71",
  },
  errorButton: {
    backgroundColor: "#E74C3C",
  },
  warningButton: {
    backgroundColor: "#F39C12",
  },
  infoButton: {
    backgroundColor: "#3498DB",
  },
  skeletonCard: {
    height: 100,
    borderRadius: 8,
    marginBottom: 16,
  },
  contentCard: {
    backgroundColor: COLORS.grey,
    borderRadius: 8,
    padding: 16,
    height: 100,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.darkWhite,
  },
});

export default RequestHandlerExample;
