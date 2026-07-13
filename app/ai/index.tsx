import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const C = {
  bg: "#F2F1FC",
  card: "#FFFFFF",
  primary: "#1BBEE4",
  primaryDark: "#0797BC",
  primaryLight: "#DDF8FF",
  text: "#171A21",
  secondary: "#667085",
  muted: "#98A2B3",
  border: "#E7EAF0",
  purple: "#7B61FF",
  purpleLight: "#EEEAFE",
  white: "#FFFFFF",
};

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

    setAnswers((current) => [mockAnswer, ...current]);
    setQuestion("");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <View style={styles.backIcon}>
            <Ionicons name="arrow-back" size={19} color={C.primaryDark} />
          </View>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles-outline" size={30} color={C.purple} />
          </View>

          <Text style={styles.eyebrow}>AI-POWERED SUPPORT</Text>
          <Text style={styles.title}>SyncTrack AI Assistant</Text>
          <Text style={styles.subtitle}>
            Ask for project help, academic explanations, coding support, or
            improvement ideas.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ask a Question</Text>
          <Text style={styles.cardSubtitle}>
            Describe what you need help with.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Example: How can I improve my project?"
            placeholderTextColor={C.muted}
            value={question}
            onChangeText={setQuestion}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.button,
              !question.trim() && styles.buttonDisabled,
            ]}
            onPress={askAi}
            disabled={!question.trim()}
            activeOpacity={0.86}
          >
            <Text style={styles.buttonText}>Ask AI</Text>
            <Ionicons name="arrow-forward" size={17} color={C.white} />
          </TouchableOpacity>
        </View>

        {answers.map((answer, index) => (
          <View key={`${answer}-${index}`} style={styles.answerCard}>
            <View style={styles.answerHeader}>
              <View style={styles.answerIcon}>
                <Ionicons name="sparkles" size={18} color={C.purple} />
              </View>
              <Text style={styles.answerTitle}>AI Response</Text>
            </View>
            <Text style={styles.answerText}>{answer}</Text>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingTop: 16 },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  backIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: C.primaryDark,
    fontWeight: "900",
    marginLeft: 8,
  },

  hero: {
    backgroundColor: C.purpleLight,
    borderWidth: 1,
    borderColor: "#DED7FF",
    borderRadius: 25,
    padding: 20,
    marginBottom: 18,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: C.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  eyebrow: {
    color: C.purple,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "900",
  },
  title: {
    color: C.text,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
    marginTop: 5,
  },
  subtitle: {
    color: C.secondary,
    marginTop: 9,
    lineHeight: 21,
    fontSize: 13,
  },

  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 23,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#1D2939",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  cardTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: "900",
  },
  cardSubtitle: {
    color: C.secondary,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  input: {
    minHeight: 120,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 14,
    color: C.text,
    textAlignVertical: "top",
    marginBottom: 14,
    fontSize: 14,
  },
  button: {
    backgroundColor: C.primary,
    paddingVertical: 14,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: C.white,
    fontWeight: "900",
    fontSize: 14,
  },

  answerCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 21,
    padding: 18,
    marginBottom: 14,
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  answerIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: C.purpleLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  answerTitle: {
    color: C.text,
    fontWeight: "900",
    fontSize: 15,
  },
  answerText: {
    color: C.secondary,
    lineHeight: 22,
  },
});