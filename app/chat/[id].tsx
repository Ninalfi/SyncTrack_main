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

const chatData = {
  "1": {
    name: "Dr. Smith",
    role: "Professor",
    messages: [
      { id: "1", sender: "professor", text: "Please update your project progress.", time: "2 min ago" },
      { id: "2", sender: "student", text: "Sure, I will upload the latest report today.", time: "Now" },
    ],
  },
  "2": {
    name: "Mr. Ahmed",
    role: "Professor",
    messages: [
      { id: "1", sender: "professor", text: "Weather app UI looks good.", time: "1 hour ago" },
      { id: "2", sender: "student", text: "Thank you, I am working on the chart section.", time: "45 min ago" },
    ],
  },
};

export default function ChatDetailsScreen() {
  const { id } = useLocalSearchParams();
  const chat = chatData[id as keyof typeof chatData];

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(chat?.messages || []);

  function sendMessage() {
    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        sender: "student",
        text: message.trim(),
        time: "Now",
      },
    ]);

    setMessage("");
  }

  if (!chat) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Chat not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#60A5FA" />
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>{chat.name}</Text>
          <Text style={styles.subtitle}>{chat.role}</Text>
        </View>
      </View>

      <ScrollView style={styles.chatArea} showsVerticalScrollIndicator={false}>
        {messages.map((item) => {
          const isStudent = item.sender === "student";

          return (
            <View
              key={item.id}
              style={[
                styles.messageBubble,
                isStudent ? styles.studentBubble : styles.professorBubble,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageTime}>{item.time}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#64748B"
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: "#94A3B8",
    marginTop: 2,
  },
  chatArea: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  studentBubble: {
    backgroundColor: "#2563EB",
    alignSelf: "flex-end",
  },
  professorBubble: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#FFFFFF",
    fontWeight: "700",
    lineHeight: 20,
  },
  messageTime: {
    color: "#CBD5E1",
    fontSize: 11,
    marginTop: 6,
  },
  inputArea: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingTop: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 16,
    padding: 14,
    color: "#F8FAFC",
  },
  sendButton: {
    backgroundColor: "#2563EB",
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});