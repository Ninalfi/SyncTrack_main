import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const messages = [
  {
    id: "1",
    name: "Dr. Smith",
    role: "Professor",
    online: true,
    unread: 2,
    lastMessage: "Please update your project progress.",
    time: "2 min ago",
  },
  {
    id: "2",
    name: "Mr. Ahmed",
    role: "Professor",
    online: false,
    unread: 0,
    lastMessage: "Weather app UI looks good.",
    time: "1 hour ago",
  },
];

const submissions = [
  {
    id: "1",
    fileName: "Project_Report.pdf",
    project: "Solar System Diorama",
    status: "Approved",
    uploadedAt: "Today",
  },
  {
    id: "2",
    fileName: "UI_Prototype.zip",
    project: "Weather Tracking App",
    status: "Pending Review",
    uploadedAt: "Yesterday",
  },
];

const resources = [
  {
    id: "1",
    title: "React Native Notes",
    type: "PDF",
    subject: "ICT",
  },
  {
    id: "2",
    title: "Project Submission Template",
    type: "DOCX",
    subject: "General",
  },
  {
    id: "3",
    title: "Operating Systems Guide",
    type: "Video",
    subject: "Computing",
  },
];

const aiSuggestions = [
  "Help me improve my dashboard UI",
  "Explain CPU scheduling",
  "Suggest project ideas",
  "Help debug React Native error",
];

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Workspace</Text>
      <Text style={styles.subtitle}>
        Communicate, submit files, access resources, and get AI-powered support.
      </Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Messages</Text>
            <Text style={styles.cardSubtitle}>Chat with professors</Text>
          </View>
          <Ionicons name="chatbubbles-outline" size={24} color="#60A5FA" />
        </View>

        {messages.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.messageCard}
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.messageName}>{item.name}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>

              <Text style={styles.roleText}>{item.role}</Text>
              <Text style={styles.previewText}>{item.lastMessage}</Text>
            </View>

            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>File Submission Center</Text>
            <Text style={styles.cardSubtitle}>Upload and track project files</Text>
          </View>
          <Ionicons name="cloud-upload-outline" size={24} color="#22C55E" />
        </View>

        <TouchableOpacity style={styles.uploadButton}>
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.uploadText}>Upload New File</Text>
        </TouchableOpacity>

        {submissions.map((item) => (
          <View key={item.id} style={styles.fileCard}>
            <Ionicons name="document-text-outline" size={24} color="#60A5FA" />

            <View style={{ flex: 1 }}>
              <Text style={styles.fileName}>{item.fileName}</Text>
              <Text style={styles.fileMeta}>
                {item.project} • {item.uploadedAt}
              </Text>
            </View>

            <Text
              style={[
                styles.status,
                item.status === "Approved" ? styles.approved : styles.pending,
              ]}
            >
              {item.status}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Resource Library</Text>
            <Text style={styles.cardSubtitle}>Learning materials from professors</Text>
          </View>
          <Ionicons name="library-outline" size={24} color="#F59E0B" />
        </View>

        {resources.map((item) => (
          <View key={item.id} style={styles.resourceCard}>
            <View style={styles.resourceIcon}>
              <Text style={styles.resourceType}>{item.type}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.resourceTitle}>{item.title}</Text>
              <Text style={styles.resourceSubject}>{item.subject}</Text>
            </View>

            <Ionicons name="download-outline" size={22} color="#60A5FA" />
          </View>
        ))}
      </View>

      <View style={styles.aiCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>SyncTrack AI Assistant</Text>
            <Text style={styles.aiSubtitle}>Ask for project help, explanations, or debugging support</Text>
          </View>
          <Ionicons name="sparkles-outline" size={26} color="#DBEAFE" />
        </View>

        {aiSuggestions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.aiSuggestion}
            onPress={() => router.push(`/ai?prompt=${encodeURIComponent(item)}`)}
          >
            <Text style={styles.aiSuggestionText}>{item}</Text>
            <Ionicons name="arrow-forward-outline" size={18} color="#DBEAFE" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.aiButton} onPress={() => router.push("/ai")}>
          <Text style={styles.aiButtonText}>Open AI Assistant</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    padding: 20,
  },
  pageTitle: {
    color: "#F8FAFC",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 8,
  },
  subtitle: {
    color: "#94A3B8",
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },
  aiCard: {
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    color: "#F8FAFC",
    fontSize: 21,
    fontWeight: "900",
  },
  cardSubtitle: {
    color: "#94A3B8",
    marginTop: 4,
    fontSize: 13,
  },
  aiSubtitle: {
    color: "#DBEAFE",
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
  },
  messageCard: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  messageName: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 15,
  },
  timeText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
  },
  roleText: {
    color: "#60A5FA",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "700",
  },
  previewText: {
    color: "#94A3B8",
    marginTop: 4,
    fontSize: 13,
  },
  unreadBadge: {
    backgroundColor: "#EF4444",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  uploadButton: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  uploadText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  fileCard: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fileName: {
    color: "#F8FAFC",
    fontWeight: "900",
  },
  fileMeta: {
    color: "#94A3B8",
    marginTop: 4,
    fontSize: 12,
  },
  status: {
    fontSize: 11,
    fontWeight: "900",
  },
  approved: {
    color: "#22C55E",
  },
  pending: {
    color: "#F59E0B",
  },
  resourceCard: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resourceIcon: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  resourceType: {
    color: "#F8FAFC",
    fontSize: 11,
    fontWeight: "900",
  },
  resourceTitle: {
    color: "#F8FAFC",
    fontWeight: "900",
  },
  resourceSubject: {
    color: "#94A3B8",
    marginTop: 4,
    fontSize: 12,
  },
  aiSuggestion: {
    backgroundColor: "#1E3A8A",
    borderWidth: 1,
    borderColor: "#2563EB",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiSuggestionText: {
    color: "#DBEAFE",
    fontWeight: "800",
    flex: 1,
  },
  aiButton: {
    backgroundColor: "#DBEAFE",
    padding: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  aiButtonText: {
    color: "#172554",
    textAlign: "center",
    fontWeight: "900",
  },
});