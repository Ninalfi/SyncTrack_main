import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const C = {
  bg: "#F2F1FC",
  card: "#FFFFFF",
  soft: "#F8FAFC",
  primary: "#1BBEE4",
  primaryDark: "#0797BC",
  primaryLight: "#DDF8FF",
  text: "#171A21",
  secondary: "#667085",
  muted: "#98A2B3",
  border: "#E7EAF0",
  divider: "#EEF1F5",
  success: "#63C174",
  successLight: "#EAF8ED",
  warning: "#F5AE2B",
  warningLight: "#FFF5DC",
  danger: "#EF5A5A",
  dangerLight: "#FFF0F0",
  purple: "#7B61FF",
  purpleLight: "#EEEAFE",
  white: "#FFFFFF",
};

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
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>STUDENT WORKSPACE</Text>
        <Text style={styles.pageTitle}>Explore</Text>
        <Text style={styles.subtitle}>
          Communicate, submit files, access resources, and get AI-powered support.
        </Text>

        <SectionCard
          title="Messages"
          subtitle="Chat with professors"
          icon="chatbubbles-outline"
          iconColor={C.primary}
          iconBackground={C.primaryLight}
        >
          {messages.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.messageRow,
                index === messages.length - 1 && styles.lastRow,
              ]}
              onPress={() => router.push(`/chat/${item.id}`)}
              activeOpacity={0.78}
            >
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View
                  style={[
                    styles.onlineDot,
                    { backgroundColor: item.online ? C.success : C.muted },
                  ]}
                />
              </View>

              <View style={styles.flex}>
                <View style={styles.rowBetween}>
                  <Text style={styles.messageName}>{item.name}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>

                <Text style={styles.roleText}>{item.role}</Text>
                <Text style={styles.previewText} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>

              {item.unread > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={C.muted}
                />
              )}
            </TouchableOpacity>
          ))}
        </SectionCard>

        <SectionCard
          title="File Submission Center"
          subtitle="Upload and track project files"
          icon="cloud-upload-outline"
          iconColor={C.success}
          iconBackground={C.successLight}
        >
          <TouchableOpacity style={styles.uploadButton} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={20} color={C.white} />
            <Text style={styles.uploadText}>Upload New File</Text>
          </TouchableOpacity>

          {submissions.map((item, index) => {
            const approved = item.status === "Approved";

            return (
              <View
                key={item.id}
                style={[
                  styles.fileRow,
                  index === submissions.length - 1 && styles.lastRow,
                ]}
              >
                <View style={styles.fileIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color={C.primaryDark}
                  />
                </View>

                <View style={styles.flex}>
                  <Text style={styles.fileName}>{item.fileName}</Text>
                  <Text style={styles.fileMeta}>
                    {item.project} · {item.uploadedAt}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: approved
                        ? C.successLight
                        : C.warningLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: approved ? C.success : C.warning },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            );
          })}
        </SectionCard>

        <SectionCard
          title="Resource Library"
          subtitle="Learning materials from professors"
          icon="library-outline"
          iconColor={C.warning}
          iconBackground={C.warningLight}
        >
          {resources.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.resourceRow,
                index === resources.length - 1 && styles.lastRow,
              ]}
              activeOpacity={0.76}
            >
              <View style={styles.resourceTypeBox}>
                <Text style={styles.resourceType}>{item.type}</Text>
              </View>

              <View style={styles.flex}>
                <Text style={styles.resourceTitle}>{item.title}</Text>
                <Text style={styles.resourceSubject}>{item.subject}</Text>
              </View>

              <View style={styles.downloadButton}>
                <Ionicons
                  name="download-outline"
                  size={19}
                  color={C.primaryDark}
                />
              </View>
            </TouchableOpacity>
          ))}
        </SectionCard>

        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiHeaderIcon}>
              <Ionicons
                name="sparkles-outline"
                size={25}
                color={C.purple}
              />
            </View>

            <View style={styles.flex}>
              <Text style={styles.aiTitle}>SyncTrack AI Assistant</Text>
              <Text style={styles.aiSubtitle}>
                Ask for project help, explanations, or debugging support.
              </Text>
            </View>
          </View>

          {aiSuggestions.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.aiSuggestion}
              onPress={() =>
                router.push(`/ai?prompt=${encodeURIComponent(item)}`)
              }
              activeOpacity={0.82}
            >
              <Text style={styles.aiSuggestionText}>{item}</Text>
              <Ionicons
                name="arrow-forward"
                size={17}
                color={C.purple}
              />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => router.push("/ai")}
            activeOpacity={0.86}
          >
            <Text style={styles.aiButtonText}>Open AI Assistant</Text>
            <Ionicons name="sparkles" size={17} color={C.white} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({
  title,
  subtitle,
  icon,
  iconColor,
  iconBackground,
  children,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>

        <View style={[styles.headerIcon, { backgroundColor: iconBackground }]}>
          <Ionicons name={icon} size={23} color={iconColor} />
        </View>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  eyebrow: {
    color: C.primaryDark,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  pageTitle: {
    color: C.text,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "900",
    marginTop: 3,
  },

  subtitle: {
    color: C.secondary,
    marginTop: 6,
    marginBottom: 22,
    lineHeight: 21,
    fontSize: 13,
  },

  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 24,
    padding: 17,
    marginBottom: 20,
    shadowColor: "#1D2939",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  cardTitle: {
    color: C.text,
    fontSize: 19,
    fontWeight: "900",
  },

  cardSubtitle: {
    color: C.secondary,
    marginTop: 4,
    fontSize: 12,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },

  avatarWrap: {
    marginRight: 12,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: C.white,
    fontWeight: "900",
    fontSize: 17,
  },

  onlineDot: {
    position: "absolute",
    right: -1,
    bottom: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.card,
  },

  flex: {
    flex: 1,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  messageName: {
    color: C.text,
    fontWeight: "900",
    fontSize: 14,
  },

  timeText: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "700",
  },

  roleText: {
    color: C.primaryDark,
    fontSize: 11,
    marginTop: 2,
    fontWeight: "700",
  },

  previewText: {
    color: C.secondary,
    marginTop: 4,
    fontSize: 12,
    paddingRight: 8,
  },

  unreadBadge: {
    backgroundColor: C.danger,
    minWidth: 23,
    height: 23,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: 7,
  },

  unreadText: {
    color: C.white,
    fontSize: 11,
    fontWeight: "900",
  },

  uploadButton: {
    backgroundColor: C.primary,
    paddingVertical: 13,
    borderRadius: 15,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  uploadText: {
    color: C.white,
    fontWeight: "900",
    fontSize: 13,
  },

  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },

  fileIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  fileName: {
    color: C.text,
    fontWeight: "900",
    fontSize: 13,
  },

  fileMeta: {
    color: C.secondary,
    marginTop: 4,
    fontSize: 11,
  },

  statusBadge: {
    borderRadius: 13,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginLeft: 8,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },

  resourceTypeBox: {
    minWidth: 48,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.warningLight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    marginRight: 11,
  },

  resourceType: {
    color: C.warning,
    fontSize: 10,
    fontWeight: "900",
  },

  resourceTitle: {
    color: C.text,
    fontWeight: "900",
    fontSize: 13,
  },

  resourceSubject: {
    color: C.secondary,
    marginTop: 4,
    fontSize: 11,
  },

  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  aiCard: {
    backgroundColor: C.purpleLight,
    borderWidth: 1,
    borderColor: "#DED7FF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },

  aiHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },

  aiHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  aiTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: "900",
  },

  aiSubtitle: {
    color: C.secondary,
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
  },

  aiSuggestion: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: "#E2DEFF",
    paddingVertical: 12,
    paddingHorizontal: 13,
    borderRadius: 14,
    marginBottom: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  aiSuggestionText: {
    color: C.text,
    fontWeight: "700",
    fontSize: 12,
    flex: 1,
  },

  aiButton: {
    backgroundColor: C.purple,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  aiButtonText: {
    color: C.white,
    fontWeight: "900",
    fontSize: 13,
  },
});