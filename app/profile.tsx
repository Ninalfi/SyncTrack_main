import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

import { useAuth } from "../context/AuthContext";

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

type ProfileDocument = {
  id: string;
  name: string;
  uri: string;
  type: "PDF" | "PPT" | "DOC" | "FILE";
  addedAt: string;
  size?: number;
};

const STUDENT_DOCS_KEY = "@synctrack_student_profile_documents";
const TEACHER_DOCS_KEY = "@synctrack_teacher_profile_documents";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const isTeacher = user?.role === "professor";
  const [documents, setDocuments] = useState<ProfileDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  const storageKey = isTeacher ? TEACHER_DOCS_KEY : STUDENT_DOCS_KEY;

  const userName =
    user?.name ||
    user?.email?.split("@")[0] ||
    (isTeacher ? "Professor" : "Student");

  const initials = useMemo(
    () =>
      userName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [userName]
  );

  useEffect(() => {
    void loadDocuments();
  }, [storageKey]);

  async function loadDocuments() {
    try {
      const saved = await AsyncStorage.getItem(storageKey);

      if (!saved) {
        setDocuments([]);
        return;
      }

      const parsed = JSON.parse(saved);
      setDocuments(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.log("Profile document load error:", error);
      setDocuments([]);
    }
  }

  async function saveDocuments(items: ProfileDocument[]) {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.log("Profile document save error:", error);
      Alert.alert(
        "Save failed",
        "The document list could not be saved on this device."
      );
    }
  }

  async function pickDocument() {
    if (uploading) return;

    try {
      setUploading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const file = result.assets[0];

      const newDocument: ProfileDocument = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name || "Untitled document",
        uri: file.uri,
        type: getDocumentType(file.name || ""),
        addedAt: new Date().toLocaleDateString(),
        size: file.size ?? undefined,
      };

      const updated = [newDocument, ...documents];
      setDocuments(updated);
      await saveDocuments(updated);

      Alert.alert(
        "Document added",
        `${newDocument.name} was added to your profile.`
      );
    } catch (error) {
      console.log("Profile document picker error:", error);
      Alert.alert(
        "Could not add document",
        "The selected document could not be added."
      );
    } finally {
      setUploading(false);
    }
  }

  async function openDocument(item: ProfileDocument) {
    try {
      const canOpen = await Linking.canOpenURL(item.uri);

      if (!canOpen) {
        Alert.alert(
          "Cannot open document",
          "This document is no longer available at its saved location."
        );
        return;
      }

      await Linking.openURL(item.uri);
    } catch (error) {
      console.log("Open profile document error:", error);
      Alert.alert(
        "Cannot open document",
        "The selected document could not be opened."
      );
    }
  }

  function confirmDeleteDocument(item: ProfileDocument) {
    Alert.alert(
      "Delete document",
      `Remove ${item.name} from your profile?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteDocument(item.id);
          },
        },
      ]
    );
  }

  async function deleteDocument(id: string) {
    const updated = documents.filter((item) => item.id !== id);
    setDocuments(updated);
    await saveDocuments(updated);
  }

  function confirmLogout() {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login");
          },
        },
      ]
    );
  }

  const profileData = isTeacher
    ? {
        roleLabel: "Teacher Profile",
        subtitle: "Academic staff workspace",
        department: user?.department || "Computer Science and Engineering",
        semester: "Faculty Member",
        designation: user?.designation || "Assistant Professor",
        idLabel: "Employee ID",
        idValue: user?.employeeId || "FAC-2026-001",
        icon: "school-outline" as const,
        accent: C.purple,
        accentLight: C.purpleLight,
      }
    : {
        roleLabel: "Student Profile",
        subtitle: "Academic identity and documents",
        department: user?.department || "Computer Science and Engineering",
        semester: user?.semester || "8th Semester",
        designation: user?.program || "BSc in CSE",
        idLabel: "Student ID",
        idValue: user?.studentId || "STU-2026-001",
        icon: "person-outline" as const,
        accent: C.primary,
        accentLight: C.primaryLight,
      };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <View style={styles.backIcon}>
            <Ionicons name="arrow-back" size={19} color={C.primaryDark} />
          </View>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <View
            style={[
              styles.heroAccent,
              { backgroundColor: profileData.accentLight },
            ]}
          />

          <View style={styles.profileTop}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: profileData.accentLight },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  { color: profileData.accent },
                ]}
              >
                {initials}
              </Text>
            </View>

            <View style={styles.profileHeading}>
              <Text style={styles.roleLabel}>{profileData.roleLabel}</Text>
              <Text style={styles.name}>{userName}</Text>
              <Text style={styles.subtitle}>{profileData.subtitle}</Text>
            </View>

            <View
              style={[
                styles.roleIcon,
                { backgroundColor: profileData.accentLight },
              ]}
            >
              <Ionicons
                name={profileData.icon}
                size={23}
                color={profileData.accent}
              />
            </View>
          </View>

          <View style={styles.emailRow}>
            <Ionicons name="mail-outline" size={17} color={C.secondary} />
            <Text style={styles.emailText}>
              {user?.email || "email@example.com"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {isTeacher ? "Teacher Information" : "Student Information"}
        </Text>

        <View style={styles.infoCard}>
          <InfoRow
            icon="business-outline"
            label="Department"
            value={profileData.department}
          />

          <InfoRow
            icon={isTeacher ? "ribbon-outline" : "calendar-outline"}
            label={isTeacher ? "Designation" : "Semester"}
            value={isTeacher ? profileData.designation : profileData.semester}
          />

          <InfoRow
            icon={isTeacher ? "book-outline" : "school-outline"}
            label={isTeacher ? "Academic Role" : "Programme"}
            value={isTeacher ? profileData.semester : profileData.designation}
          />

          <InfoRow
            icon="id-card-outline"
            label={profileData.idLabel}
            value={profileData.idValue}
            isLast
          />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Documents</Text>
            <Text style={styles.sectionSubtitle}>
              PDF, PPT, and DOC files
            </Text>
          </View>

          <View style={styles.documentCount}>
            <Text style={styles.documentCountText}>{documents.length}</Text>
          </View>
        </View>

        <View style={styles.documentsCard}>
          <TouchableOpacity
            style={[
              styles.addDocumentButton,
              uploading && styles.disabledButton,
            ]}
            onPress={pickDocument}
            disabled={uploading}
            activeOpacity={0.85}
          >
            <Ionicons
              name={uploading ? "hourglass-outline" : "add-circle-outline"}
              size={20}
              color={C.white}
            />
            <Text style={styles.addDocumentText}>
              {uploading ? "Adding Document..." : "Add Document"}
            </Text>
          </TouchableOpacity>

          {documents.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="documents-outline"
                  size={31}
                  color={profileData.accent}
                />
              </View>
              <Text style={styles.emptyTitle}>No documents added</Text>
              <Text style={styles.emptyText}>
                Add certificates, academic files, presentations, reports, or
                supporting documents to your profile.
              </Text>
            </View>
          ) : (
            documents.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.documentRow,
                  index === documents.length - 1 && styles.lastRow,
                ]}
              >
                <TouchableOpacity
                  style={styles.documentOpenArea}
                  onPress={() => openDocument(item)}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.documentType,
                      { backgroundColor: getDocumentColor(item.type).light },
                    ]}
                  >
                    <Text
                      style={[
                        styles.documentTypeText,
                        { color: getDocumentColor(item.type).main },
                      ]}
                    >
                      {item.type}
                    </Text>
                  </View>

                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.documentMeta}>
                      Added {item.addedAt} · {formatFileSize(item.size)}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.documentActions}>
                  <TouchableOpacity
                    style={styles.openDocumentButton}
                    onPress={() => openDocument(item)}
                  >
                    <Ionicons
                      name="open-outline"
                      size={18}
                      color={C.primaryDark}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteDocumentButton}
                    onPress={() => confirmDeleteDocument(item)}
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
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={confirmLogout}
          activeOpacity={0.86}
        >
          <Ionicons name="log-out-outline" size={20} color={C.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 70 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, isLast && styles.lastRow]}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={19} color={C.primaryDark} />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function getDocumentType(
  fileName: string
): ProfileDocument["type"] {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "pdf") return "PDF";
  if (["ppt", "pptx"].includes(extension || "")) return "PPT";
  if (["doc", "docx"].includes(extension || "")) return "DOC";

  return "FILE";
}

function getDocumentColor(type: ProfileDocument["type"]) {
  if (type === "PDF") {
    return { main: C.danger, light: C.dangerLight };
  }

  if (type === "PPT") {
    return { main: C.warning, light: C.warningLight };
  }

  if (type === "DOC") {
    return { main: C.primaryDark, light: C.primaryLight };
  }

  return { main: C.purple, light: C.purpleLight };
}

function formatFileSize(size?: number) {
  if (typeof size !== "number" || size <= 0) return "Size unavailable";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  backButton: {
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

  heroCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 26,
    padding: 20,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#1D2939",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },

  heroAccent: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -55,
    top: -65,
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "900",
  },

  profileHeading: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 8,
  },

  roleLabel: {
    color: C.primaryDark,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  name: {
    color: C.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    marginTop: 3,
  },

  subtitle: {
    color: C.secondary,
    fontSize: 12,
    marginTop: 3,
  },

  roleIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.soft,
    borderRadius: 14,
    padding: 12,
    marginTop: 17,
  },

  emailText: {
    color: C.secondary,
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "700",
  },

  sectionTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },

  sectionSubtitle: {
    color: C.secondary,
    fontSize: 11,
    marginTop: -8,
  },

  infoCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 23,
    paddingHorizontal: 17,
    marginBottom: 24,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: C.secondary,
    fontSize: 10,
    fontWeight: "700",
  },

  infoValue: {
    color: C.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  documentCount: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  documentCountText: {
    color: C.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },

  documentsCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 23,
    padding: 17,
    marginBottom: 24,
  },

  addDocumentButton: {
    backgroundColor: C.primary,
    borderRadius: 15,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },

  disabledButton: {
    opacity: 0.55,
  },

  addDocumentText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "900",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 27,
    paddingHorizontal: 14,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 12,
  },

  emptyText: {
    color: C.secondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 5,
  },

  documentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },

  documentOpenArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  documentType: {
    width: 47,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  documentTypeText: {
    fontSize: 10,
    fontWeight: "900",
  },

  documentInfo: {
    flex: 1,
    marginLeft: 11,
  },

  documentName: {
    color: C.text,
    fontSize: 13,
    fontWeight: "900",
  },

  documentMeta: {
    color: C.secondary,
    fontSize: 10,
    marginTop: 4,
  },

  documentActions: {
    marginLeft: 8,
    gap: 7,
  },

  openDocumentButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteDocumentButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.dangerLight,
    alignItems: "center",
    justifyContent: "center",
  },

  logoutButton: {
    backgroundColor: C.danger,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "900",
  },

  lastRow: {
    borderBottomWidth: 0,
  },
});