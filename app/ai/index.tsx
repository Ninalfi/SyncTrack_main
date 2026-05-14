import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AiAssistantScreen() {
  const { prompt } = useLocalSearchParams();

  const [question, setQuestion] = useState(
    typeof prompt === "string" ? prompt : ""
  );

  const [answers, setAnswers] = useState<string[]>([]);

  function askAi() {
    if (!question.trim()) return;

    const mockAnswer =
      "SyncTrack AI suggestion: Break your project into smaller milestones, update your progress regularly, and review professor feedback before final submission.";

    setAnswers([mockAnswer, ...answers]);
    setQuestion("");
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
        <Ionicons name="arrow-back-outline" size={22} color="#60A5FA" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.hero}>
        <Ionicons name="sparkles-outline" size={34} color="#DBEAFE" />
        <Text style={styles.title}>SyncTrack AI Assistant</Text>
        <Text style={styles.subtitle}>
          Ask for project help, academic explanations, coding support, or improvement ideas.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ask a Question</Text>

        <TextInput
          style={styles.input}
          placeholder="Example: How can I improve my project?"
          placeholderTextColor="#64748B"
          value={question}
          onChangeText={setQuestion}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={askAi}>
          <Text style={styles.buttonText}>Ask AI</Text>
        </TouchableOpacity>
      </View>

      {answers.map((answer, index) => (
        <View key={index} style={styles.answerCard}>
          <Text style={styles.answerTitle}>AI Response</Text>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    padding: 20,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    color: "#60A5FA",
    fontWeight: "900",
  },
  hero: {
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 26,
    padding: 22,
    marginBottom: 18,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 12,
  },
  subtitle: {
    color: "#DBEAFE",
    marginTop: 10,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  cardTitle: {
    color: "#F8FAFC",
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 14,
  },
  input: {
    minHeight: 110,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 16,
    padding: 14,
    color: "#F8FAFC",
    textAlignVertical: "top",
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
  },
  answerCard: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  answerTitle: {
    color: "#60A5FA",
    fontWeight: "900",
    marginBottom: 8,
  },
  answerText: {
    color: "#CBD5E1",
    lineHeight: 22,
  },
});