import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  Alert,
  Linking,
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

type SubmissionStatus = "Pending Review" | "Approved" | "Rejected";

type Submission = {
  id: string;
  fileName: string;
  project: string;
  status: SubmissionStatus;
  uploadedAt: string;
  uri: string;
  mimeType?: string;
  size?: number;
};

const SUBMISSIONS_STORAGE_KEY = "@synctrack_submissions";

type Resource = {
  id: string;
  title: string;
  type: string;
  subject: string;
  addedAt: string;
  uri: string;
  mimeType?: string;
  size?: number;
};

const RESOURCES_STORAGE_KEY = "@synctrack_resources";

const aiSuggestions = [
  "Help me improve my dashboard UI",
  "Explain CPU scheduling",
  "Suggest project ideas",
  "Help debug React Native error",
];

export default function ExploreScreen() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [uploading, setUploading] = useState(false);
  const [addingResource, setAddingResource] = useState(false);

  useEffect(() => {
    void Promise.all([loadSubmissions(), loadResources()]);
  }, []);

  async function loadSubmissions() {
    try {
      const savedData = await AsyncStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (!savedData) return setSubmissions([]);
      const parsed = JSON.parse(savedData);
      setSubmissions(Array.isArray(parsed) ? (parsed as Submission[]) : []);
    } catch (error) {
      console.log("Could not load submissions:", error);
      setSubmissions([]);
    }
  }

  async function saveSubmissions(items: Submission[]) {
    try {
      await AsyncStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.log("Could not save submissions:", error);
      Alert.alert("Save failed", "The submission list could not be saved on this device.");
    }
  }

  async function loadResources() {
    try {
      const savedData = await AsyncStorage.getItem(RESOURCES_STORAGE_KEY);

      if (!savedData) {
        setResources([]);
        return;
      }

      const parsed = JSON.parse(savedData);
      setResources(Array.isArray(parsed) ? (parsed as Resource[]) : []);
    } catch (error) {
      console.log("Could not load resources:", error);
      setResources([]);
    }
  }

  async function saveResources(items: Resource[]) {
    try {
      await AsyncStorage.setItem(
        RESOURCES_STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.log("Could not save resources:", error);
      Alert.alert(
        "Save failed",
        "The resource library could not be saved on this device."
      );
    }
  }

  async function pickAndAddResource() {
    if (addingResource) return;

    try {
      setAddingResource(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/zip",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "image/*",
          "video/*",
          "text/plain",
        ],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const file = result.assets[0];

      const newResource: Resource = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: removeFileExtension(file.name || "Untitled resource"),
        type: getFileTypeLabel(file.name || ""),
        subject: "General",
        addedAt: new Date().toLocaleDateString(),
        uri: file.uri,
        mimeType: file.mimeType ?? undefined,
        size: file.size ?? undefined,
      };

      const updatedResources = [newResource, ...resources];

      setResources(updatedResources);
      await saveResources(updatedResources);

      Alert.alert(
        "Resource added",
        `${newResource.title} has been added to the library.`
      );
    } catch (error) {
      console.log("Resource upload error:", error);
      Alert.alert(
        "Could not add resource",
        "The selected resource could not be added."
      );
    } finally {
      setAddingResource(false);
    }
  }

  async function openResource(item: Resource) {
    try {
      const canOpen = await Linking.canOpenURL(item.uri);

      if (!canOpen) {
        Alert.alert(
          "Cannot open resource",
          "This resource is no longer available at its saved location."
        );
        return;
      }

      await Linking.openURL(item.uri);
    } catch (error) {
      console.log("Open resource error:", error);
      Alert.alert(
        "Cannot open resource",
        "The selected resource could not be opened."
      );
    }
  }

  function confirmDeleteResource(item: Resource) {
    Alert.alert(
      "Delete resource",
      `Remove ${item.title} from the resource library?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteResource(item.id);
          },
        },
      ]
    );
  }

  async function deleteResource(id: string) {
    const updatedResources = resources.filter(
      (resource) => resource.id !== id
    );

    setResources(updatedResources);
    await saveResources(updatedResources);
  }

  async function pickAndUploadFile() {
    if (uploading) return;
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/zip",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "image/*",
          "text/plain",
        ],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;
      const file = result.assets[0];

      const newSubmission: Submission = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fileName: file.name || "Untitled file",
        project: "SyncTrack Project",
        status: "Pending Review",
        uploadedAt: new Date().toLocaleDateString(),
        uri: file.uri,
        mimeType: file.mimeType ?? undefined,
        size: file.size ?? undefined,
      };

      const updated = [newSubmission, ...submissions];
      setSubmissions(updated);
      await saveSubmissions(updated);
      Alert.alert("Upload successful", `${newSubmission.fileName} has been submitted for review.`);
    } catch (error) {
      console.log("File upload error:", error);
      Alert.alert("Upload failed", "The selected file could not be added.");
    } finally {
      setUploading(false);
    }
  }

  function confirmDeleteSubmission(item: Submission) {
    Alert.alert("Delete submission", `Remove ${item.fileName} from the submission list?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void deleteSubmission(item.id) },
    ]);
  }

  async function deleteSubmission(id: string) {
    const updated = submissions.filter((item) => item.id !== id);
    setSubmissions(updated);
    await saveSubmissions(updated);
  }

  async function openSubmission(item: Submission) {
    try {
      const canOpen = await Linking.canOpenURL(item.uri);
      if (!canOpen) {
        Alert.alert("Cannot open file", "This file is no longer available at its saved location.");
        return;
      }
      await Linking.openURL(item.uri);
    } catch (error) {
      console.log("Open file error:", error);
      Alert.alert("Cannot open file", "The selected file could not be opened.");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>STUDENT WORKSPACE</Text>
        <Text style={styles.pageTitle}>Explore</Text>
        <Text style={styles.subtitle}>Communicate, submit files, access resources, and get AI-powered support.</Text>

        <SectionCard title="Messages" subtitle="Chat with professors" icon="chatbubbles-outline" iconColor={C.primary} iconBackground={C.primaryLight}>
          {messages.map((item, index) => (
            <TouchableOpacity key={item.id} style={[styles.messageRow, index === messages.length - 1 && styles.lastRow]} onPress={() => router.push(`/chat/${item.id}`)} activeOpacity={0.78}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.charAt(0)}</Text></View>
                <View style={[styles.onlineDot, { backgroundColor: item.online ? C.success : C.muted }]} />
              </View>
              <View style={styles.flex}>
                <View style={styles.rowBetween}><Text style={styles.messageName}>{item.name}</Text><Text style={styles.timeText}>{item.time}</Text></View>
                <Text style={styles.roleText}>{item.role}</Text>
                <Text style={styles.previewText} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              {item.unread > 0 ? <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unread}</Text></View> : <Ionicons name="chevron-forward" size={17} color={C.muted} />}
            </TouchableOpacity>
          ))}
        </SectionCard>

        <SectionCard title="File Submission Center" subtitle={`${submissions.length} submitted file${submissions.length === 1 ? "" : "s"}`} icon="cloud-upload-outline" iconColor={C.success} iconBackground={C.successLight}>
          <TouchableOpacity style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]} onPress={pickAndUploadFile} disabled={uploading} activeOpacity={0.85}>
            <Ionicons name={uploading ? "hourglass-outline" : "add-circle-outline"} size={20} color={C.white} />
            <Text style={styles.uploadText}>{uploading ? "Adding File..." : "Upload New File"}</Text>
          </TouchableOpacity>

          {submissions.length === 0 ? (
            <View style={styles.emptySubmission}>
              <View style={styles.emptySubmissionIcon}><Ionicons name="cloud-upload-outline" size={30} color={C.primaryDark} /></View>
              <Text style={styles.emptySubmissionTitle}>No files submitted</Text>
              <Text style={styles.emptySubmissionText}>Upload your report, presentation, source archive, image, or supporting document.</Text>
            </View>
          ) : (
            submissions.map((item, index) => {
              const statusColor = getStatusColor(item.status);
              const statusBackground = getStatusBackground(item.status);
              return (
                <View key={item.id} style={[styles.dynamicFileRow, index === submissions.length - 1 && styles.lastRow]}>
                  <TouchableOpacity style={styles.fileOpenArea} onPress={() => openSubmission(item)} activeOpacity={0.75}>
                    <View style={styles.fileIcon}><Ionicons name={getFileIcon(item.fileName)} size={22} color={C.primaryDark} /></View>
                    <View style={styles.fileInformation}>
                      <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
                      <Text style={styles.fileMeta}>{item.project} · {item.uploadedAt}</Text>
                      <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusBackground }]}><Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text></View>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.fileActions}>
                    <TouchableOpacity style={styles.openButton} onPress={() => openSubmission(item)}><Ionicons name="open-outline" size={18} color={C.primaryDark} /></TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteSubmission(item)}><Ionicons name="trash-outline" size={18} color={C.danger} /></TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </SectionCard>

        <SectionCard
          title="Resource Library"
          subtitle={`${resources.length} learning resource${
            resources.length === 1 ? "" : "s"
          }`}
          icon="library-outline"
          iconColor={C.warning}
          iconBackground={C.warningLight}
        >
          <TouchableOpacity
            style={[
              styles.resourceUploadButton,
              addingResource && styles.uploadButtonDisabled,
            ]}
            onPress={pickAndAddResource}
            disabled={addingResource}
            activeOpacity={0.85}
          >
            <Ionicons
              name={addingResource ? "hourglass-outline" : "add-circle-outline"}
              size={20}
              color={C.white}
            />

            <Text style={styles.resourceUploadText}>
              {addingResource ? "Adding Resource..." : "Add New Resource"}
            </Text>
          </TouchableOpacity>

          {resources.length === 0 ? (
            <View style={styles.emptyResource}>
              <View style={styles.emptyResourceIcon}>
                <Ionicons
                  name="library-outline"
                  size={30}
                  color={C.warning}
                />
              </View>

              <Text style={styles.emptyResourceTitle}>
                No resources available
              </Text>

              <Text style={styles.emptyResourceText}>
                Add notes, templates, presentations, videos, images, or study
                documents to build your resource library.
              </Text>
            </View>
          ) : (
            resources.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.dynamicResourceRow,
                  index === resources.length - 1 && styles.lastRow,
                ]}
              >
                <TouchableOpacity
                  style={styles.resourceOpenArea}
                  onPress={() => openResource(item)}
                  activeOpacity={0.76}
                >
                  <View style={styles.resourceTypeBox}>
                    <Text style={styles.resourceType}>{item.type}</Text>
                  </View>

                  <View style={styles.resourceInformation}>
                    <Text style={styles.resourceTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <Text style={styles.resourceSubject}>
                      {item.subject} · Added {item.addedAt}
                    </Text>

                    <Text style={styles.resourceSize}>
                      {formatFileSize(item.size)}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.resourceActions}>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => openResource(item)}
                    accessibilityLabel={`Open ${item.title}`}
                  >
                    <Ionicons
                      name="open-outline"
                      size={19}
                      color={C.primaryDark}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resourceDeleteButton}
                    onPress={() => confirmDeleteResource(item)}
                    accessibilityLabel={`Delete ${item.title}`}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={C.danger}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </SectionCard>

        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiHeaderIcon}><Ionicons name="sparkles-outline" size={25} color={C.purple} /></View>
            <View style={styles.flex}><Text style={styles.aiTitle}>SyncTrack AI Assistant</Text><Text style={styles.aiSubtitle}>Ask for project help, explanations, or debugging support.</Text></View>
          </View>
          {aiSuggestions.map((item) => (
            <TouchableOpacity key={item} style={styles.aiSuggestion} onPress={() => router.push(`/ai?prompt=${encodeURIComponent(item)}`)} activeOpacity={0.82}>
              <Text style={styles.aiSuggestionText}>{item}</Text><Ionicons name="arrow-forward" size={17} color={C.purple} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.aiButton} onPress={() => router.push("/ai")} activeOpacity={0.86}>
            <Text style={styles.aiButtonText}>Open AI Assistant</Text><Ionicons name="sparkles" size={17} color={C.white} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({ title, subtitle, icon, iconColor, iconBackground, children }: { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string; iconBackground: string; children: React.ReactNode; }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeading}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardSubtitle}>{subtitle}</Text></View>
        <View style={[styles.headerIcon, { backgroundColor: iconBackground }]}><Ionicons name={icon} size={23} color={iconColor} /></View>
      </View>
      {children}
    </View>
  );
}

function getFileIcon(fileName: string): keyof typeof Ionicons.glyphMap {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  if (extension === "pdf") return "document-text-outline";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) return "image-outline";
  if (["zip", "rar", "7z"].includes(extension)) return "archive-outline";
  if (["doc", "docx"].includes(extension)) return "document-outline";
  if (["ppt", "pptx"].includes(extension)) return "easel-outline";
  if (["txt", "md"].includes(extension)) return "reader-outline";
  return "attach-outline";
}

function formatFileSize(size?: number) {
  if (typeof size !== "number" || size <= 0) return "Size unavailable";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function removeFileExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
}

function getFileTypeLabel(fileName: string) {
  const extension = fileName.split(".").pop()?.toUpperCase();

  if (!extension || extension === fileName.toUpperCase()) {
    return "FILE";
  }

  if (extension.length > 5) {
    return "FILE";
  }

  return extension;
}

function getStatusColor(status: SubmissionStatus) {
  if (status === "Approved") return C.success;
  if (status === "Rejected") return C.danger;
  return C.warning;
}

function getStatusBackground(status: SubmissionStatus) {
  if (status === "Approved") return C.successLight;
  if (status === "Rejected") return C.dangerLight;
  return C.warningLight;
}

const styles = StyleSheet.create({
  safe: {
     flex: 1, backgroundColor: C.bg 
    },
  container: {
     flex: 1, 
     backgroundColor: C.bg
     },
  content: { 
    paddingHorizontal: 20,
     paddingTop: 16
   },
  eyebrow: { 
    color: C.primaryDark, 
    fontSize: 11, 
    fontWeight: "900",
     letterSpacing: 1
     },
  pageTitle: { 
    color: C.text, 
    fontSize: 32, 
    lineHeight: 39,
     fontWeight: "900",
      marginTop: 3
     },
  subtitle: { 
    color: C.secondary, 
    marginTop: 6, 
    marginBottom: 22, 
    lineHeight: 21, 
    fontSize: 13 
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
         elevation: 3 
        },
  cardHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between",
     alignItems: "flex-start",
      marginBottom: 14 
    },
  cardHeading: { 
    flex: 1, 
    paddingRight: 12
   },
  cardTitle: { 
    color: C.text,
     fontSize: 19,
      fontWeight: "900"
     },
  cardSubtitle: { 
    color: C.secondary,
     marginTop: 4, 
     fontSize: 12 
    },
  headerIcon: {
     width: 44,
      height: 44,
       borderRadius: 14,
        alignItems: "center",
         justifyContent: "center"
         },
  messageRow: {
     flexDirection: "row",
      alignItems: "center",
       paddingVertical: 13,
        borderBottomWidth: 1, 
        borderBottomColor: C.divider 
      },
  avatarWrap: { 
    marginRight: 12 },
  avatar: {
     width: 45,
      height: 45, 
      borderRadius: 23,
       backgroundColor: C.primary,
        alignItems: "center",
         justifyContent: "center"
         },
  avatarText: { color: C.white, fontWeight: "900", fontSize: 17 },
  onlineDot: { position: "absolute", right: -1, bottom: 1, width: 11, height: 11, borderRadius: 6, borderWidth: 2, borderColor: C.card },
  flex: { flex: 1 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  messageName: { color: C.text, fontWeight: "900", fontSize: 14 },
  timeText: { color: C.muted, fontSize: 10, fontWeight: "700" },
  roleText: { color: C.primaryDark, fontSize: 11, marginTop: 2, fontWeight: "700" },
  previewText: { color: C.secondary, marginTop: 4, fontSize: 12, paddingRight: 8 },
  unreadBadge: { backgroundColor: C.danger, minWidth: 23, height: 23, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, marginLeft: 7 },
  unreadText: { color: C.white, fontSize: 11, fontWeight: "900" },
  uploadButton: { backgroundColor: C.primary, paddingVertical: 13, borderRadius: 15, flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  uploadButtonDisabled: { opacity: 0.55 },
  uploadText: { color: C.white, fontWeight: "900", fontSize: 13 },
  emptySubmission: { alignItems: "center", paddingVertical: 27, paddingHorizontal: 16 },
  emptySubmissionIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center" },
  emptySubmissionTitle: { color: C.text, fontSize: 16, fontWeight: "900", marginTop: 12 },
  emptySubmissionText: { color: C.secondary, fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 5 },
  dynamicFileRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.divider },
  fileOpenArea: { flex: 1, flexDirection: "row", alignItems: "flex-start" },
  fileIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center" },
  fileInformation: { flex: 1, marginLeft: 11 },
  fileName: { color: C.text, fontWeight: "900", fontSize: 13 },
  fileMeta: { color: C.secondary, marginTop: 4, fontSize: 11 },
  fileSize: { color: C.muted, fontSize: 10, marginTop: 3 },
  statusBadge: { alignSelf: "flex-start", borderRadius: 13, paddingHorizontal: 9, paddingVertical: 6, marginTop: 8 },
  statusText: { fontSize: 10, fontWeight: "900" },
  fileActions: { marginLeft: 8, gap: 7 },
  openButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.primaryLight, justifyContent: "center", alignItems: "center" },
  deleteButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.dangerLight, justifyContent: "center", alignItems: "center" },
  resourceUploadButton: { backgroundColor: C.warning, paddingVertical: 13, borderRadius: 15, flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  resourceUploadText: { color: C.white, fontWeight: "900", fontSize: 13 },
  emptyResource: { alignItems: "center", paddingVertical: 27, paddingHorizontal: 16 },
  emptyResourceIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: C.warningLight, alignItems: "center", justifyContent: "center" },
  emptyResourceTitle: { color: C.text, fontSize: 16, fontWeight: "900", marginTop: 12 },
  emptyResourceText: { color: C.secondary, fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 5 },
  dynamicResourceRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.divider },
  resourceOpenArea: { flex: 1, flexDirection: "row", alignItems: "flex-start" },
  resourceTypeBox: { minWidth: 48, height: 40, borderRadius: 13, backgroundColor: C.warningLight, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  resourceType: { color: C.warning, fontSize: 10, fontWeight: "900" },
  resourceInformation: { flex: 1, marginLeft: 11 },
  resourceTitle: { color: C.text, fontWeight: "900", fontSize: 13 },
  resourceSubject: { color: C.secondary, marginTop: 4, fontSize: 11 },
  resourceSize: { color: C.muted, fontSize: 10, marginTop: 3 },
  resourceActions: { marginLeft: 8, gap: 7 },
  downloadButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center" },
  resourceDeleteButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.dangerLight, alignItems: "center", justifyContent: "center" },
  lastRow: { borderBottomWidth: 0 },
  aiCard: { backgroundColor: C.purpleLight, borderWidth: 1, borderColor: "#DED7FF", borderRadius: 24, padding: 18, marginBottom: 20 },
  aiHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 15 },
  aiHeaderIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: C.card, alignItems: "center", justifyContent: "center", marginRight: 12 },
  aiTitle: { color: C.text, fontSize: 18, fontWeight: "900" },
  aiSubtitle: { color: C.secondary, marginTop: 4, fontSize: 12, lineHeight: 18 },
  aiSuggestion: { backgroundColor: C.card, borderWidth: 1, borderColor: "#E2DEFF", paddingVertical: 12, paddingHorizontal: 13, borderRadius: 14, marginBottom: 9, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  aiSuggestionText: { color: C.text, fontWeight: "700", fontSize: 12, flex: 1 },
  aiButton: { backgroundColor: C.purple, paddingVertical: 13, paddingHorizontal: 15, borderRadius: 15, marginTop: 5, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  aiButtonText: { color: C.white, fontWeight: "900", fontSize: 13 },
});