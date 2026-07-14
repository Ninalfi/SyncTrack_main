import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

type UserRole = "student" | "professor";

export default function AuthScreen() {
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>("student");
  const [submitting, setSubmitting] = useState(false);

  // Common fields
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Student-only fields
  const [studentId, setStudentId] = useState("");
  const [semester, setSemester] = useState("");
  const [batch, setBatch] = useState("");

  // Professor-only field
  const [designation, setDesignation] = useState("");

  function resetSignupFields() {
    setName("");
    setDepartment("");
    setStudentId("");
    setSemester("");
    setBatch("");
    setDesignation("");
  }

  function switchRole(nextRole: UserRole) {
    setRole(nextRole);
    resetSignupFields();
  }

  function validateSignup() {
    if (!name.trim()) {
      Alert.alert("Missing information", "Please enter your full name.");
      return false;
    }

    if (!department.trim()) {
      Alert.alert("Missing information", "Please enter your department.");
      return false;
    }

    if (role === "student") {
      if (!studentId.trim()) {
        Alert.alert("Missing information", "Please enter your student ID.");
        return false;
      }

      if (!semester.trim()) {
        Alert.alert("Missing information", "Please enter your semester.");
        return false;
      }

      if (!batch.trim()) {
        Alert.alert("Missing information", "Please enter your batch.");
        return false;
      }
    }

    if (role === "professor" && !designation.trim()) {
      Alert.alert("Missing information", "Please enter your designation.");
      return false;
    }

    return true;
  }

  async function handleAuth() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert(
        "Missing information",
        "Please enter your email address and password."
      );
      return;
    }

    if (!isLogin && !validateSignup()) {
      return;
    }

    try {
      setSubmitting(true);

      if (isLogin) {
        const result = await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          Alert.alert(
            "Profile not found",
            "Your Firebase account exists, but your Firestore profile is missing."
          );
          return;
        }

        const userData = userSnap.data();

        if (
          userData.role !== "student" &&
          userData.role !== "professor"
        ) {
          Alert.alert(
            "Invalid role",
            "This account does not have a valid student or professor role."
          );
          return;
        }

        await login({
          uid: result.user.uid,
          email: result.user.email,
          name: userData.name || "User",
          role: userData.role,

          department: userData.department || "",

          studentId:
            userData.role === "student"
              ? userData.studentId || ""
              : undefined,

          semester:
            userData.role === "student"
              ? userData.semester || ""
              : undefined,

          batch:
            userData.role === "student"
              ? userData.batch || ""
              : undefined,

          designation:
            userData.role === "professor"
              ? userData.designation || ""
              : undefined,
        });

        if (userData.role === "professor") {
          router.replace("/(tabs)/dashboard");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        const result = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

        const commonProfile = {
          uid: result.user.uid,
          name: name.trim(),
          email: cleanEmail,
          role,
          department: department.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const studentProfile =
          role === "student"
            ? {
                studentId: studentId.trim(),
                semester: semester.trim(),
                batch: batch.trim(),
              }
            : {};

        const professorProfile =
          role === "professor"
            ? {
                designation: designation.trim(),
              }
            : {};

        const completeProfile = {
          ...commonProfile,
          ...studentProfile,
          ...professorProfile,
        };

        await setDoc(
          doc(db, "users", result.user.uid),
          completeProfile
        );

        await login({
          uid: result.user.uid,
          email: cleanEmail,
          name: name.trim(),
          role,
          department: department.trim(),

          studentId:
            role === "student"
              ? studentId.trim()
              : undefined,

          semester:
            role === "student"
              ? semester.trim()
              : undefined,

          batch:
            role === "student"
              ? batch.trim()
              : undefined,

          designation:
            role === "professor"
              ? designation.trim()
              : undefined,
        });

        if (role === "professor") {
          router.replace("/(tabs)/dashboard");
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch (error: any) {
      console.log("Firebase error code:", error?.code);
      console.log("Firebase error message:", error?.message);

      let message = "Authentication failed. Please try again.";

      switch (error?.code) {
        case "auth/email-already-in-use":
          message = "This email address is already registered.";
          break;

        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;

        case "auth/weak-password":
          message = "Password must contain at least 6 characters.";
          break;

        case "auth/invalid-credential":
          message = "The email address or password is incorrect.";
          break;

        case "auth/user-not-found":
          message = "No account was found with this email address.";
          break;

        case "auth/wrong-password":
          message = "The password is incorrect.";
          break;

        case "permission-denied":
        case "firestore/permission-denied":
          message =
            "Firestore permission was denied. Please check your security rules.";
          break;

        default:
          message = error?.message || message;
      }

      Alert.alert("Authentication failed", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>S</Text>
            </View>

            <Text style={styles.logo}>SyncTrack</Text>

            <Text style={styles.title}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </Text>

            <Text style={styles.subtitle}>
              {isLogin
                ? "Login to continue to your workspace."
                : "Choose your account type and complete your profile."}
            </Text>

            {!isLogin && (
              <>
                <Text style={styles.fieldLabel}>Account type</Text>

                <View style={styles.roleRow}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === "student" && styles.roleActive,
                    ]}
                    onPress={() => switchRole("student")}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.roleText,
                        role === "student" && styles.roleTextActive,
                      ]}
                    >
                      Student
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === "professor" && styles.roleActive,
                    ]}
                    onPress={() => switchRole("professor")}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.roleText,
                        role === "professor" && styles.roleTextActive,
                      ]}
                    >
                      Professor
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.profileHeading}>
                  {role === "student"
                    ? "Student information"
                    : "Professor information"}
                </Text>

                <FormInput
                  label={
                    role === "student"
                      ? "Student name"
                      : "Teacher name"
                  }
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />

                <FormInput
                  label="Department"
                  placeholder="Example: Computer Science"
                  value={department}
                  onChangeText={setDepartment}
                  autoCapitalize="words"
                />

                {role === "student" ? (
                  <>
                    <FormInput
                      label="Student ID"
                      placeholder="Enter your student ID"
                      value={studentId}
                      onChangeText={setStudentId}
                    />

                    <FormInput
                      label="Semester"
                      placeholder="Example: 8th Semester"
                      value={semester}
                      onChangeText={setSemester}
                    />

                    <FormInput
                      label="Batch"
                      placeholder="Example: 54"
                      value={batch}
                      onChangeText={setBatch}
                    />
                  </>
                ) : (
                  <FormInput
                    label="Designation"
                    placeholder="Example: Assistant Professor"
                    value={designation}
                    onChangeText={setDesignation}
                    autoCapitalize="words"
                  />
                )}
              </>
            )}

            <FormInput
              label="Email address"
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <FormInput
              label="Password"
              placeholder={
                isLogin
                  ? "Enter your password"
                  : "Create at least 6 characters"
              }
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[
                styles.primaryButton,
                submitting && styles.primaryButtonDisabled,
              ]}
              onPress={handleAuth}
              disabled={submitting}
              activeOpacity={0.88}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isLogin ? "Login" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsLogin((currentValue) => !currentValue);
                setPassword("");
              }}
              disabled={submitting}
            >
              <Text style={styles.switchText}>
                {isLogin
                  ? "Don’t have an account? Sign up"
                  : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric";
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1120",
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 34,
  },

  card: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 28,
    padding: 24,
  },

  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },

  logoIconText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  logo: {
    color: "#60A5FA",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 18,
    textAlign: "center",
  },

  title: {
    color: "#F8FAFC",
    fontSize: 31,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 26,
    lineHeight: 22,
  },

  profileHeading: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 4,
    marginBottom: 16,
  },

  fieldLabel: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
  },

  inputGroup: {
    marginBottom: 14,
  },

  input: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 14,
    color: "#F8FAFC",
    fontSize: 14,
  },

  roleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  roleButton: {
    flex: 1,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingVertical: 14,
    borderRadius: 14,
  },

  roleActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  roleText: {
    color: "#94A3B8",
    textAlign: "center",
    fontWeight: "900",
  },

  roleTextActive: {
    color: "#FFFFFF",
  },

  primaryButton: {
    minHeight: 52,
    backgroundColor: "#2563EB",
    paddingHorizontal: 15,
    borderRadius: 16,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  primaryButtonDisabled: {
    opacity: 0.65,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },

  switchText: {
    color: "#60A5FA",
    textAlign: "center",
    fontWeight: "800",
    marginTop: 18,
  },
});