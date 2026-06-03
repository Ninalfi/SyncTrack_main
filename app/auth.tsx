import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

type UserRole = "student" | "professor";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");

  const { login } = useAuth();

  async function handleAuth() {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);

        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);

if (!userSnap.exists()) {
  Alert.alert(
    "User profile missing",
    "Your account exists, but your role profile was not found. Please sign up again or create the user role in Firestore."
  );
  return;
}

        const userData = userSnap.data();

        await login({
          uid: result.user.uid,
          email: result.user.email,
          name: userData.name,
          role: userData.role,
        });

        if (userData.role === "professor") {
          router.replace("/(tabs)/dashboard");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await setDoc(doc(db, "users", result.user.uid), {
          name,
          email,
          role,
          createdAt: new Date().toISOString(),
        });

        await login({
          uid: result.user.uid,
          email,
          name,
          role,
        });

        if (role === "professor") {
          router.replace("/(tabs)/dashboard");
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch (error: any) {
      console.log("Firebase error code:", error.code);
console.log("Firebase error message:", error.message);
Alert.alert("Authentication failed", error.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>SyncTrack</Text>

        <Text style={styles.title}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </Text>

        <Text style={styles.subtitle}>
          {isLogin
            ? "Login to continue to your workspace."
            : "Select your role and create your account."}
        </Text>

        {!isLogin && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
            />

            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "student" && styles.roleActive,
                ]}
                onPress={() => setRole("student")}
              >
                <Text style={styles.roleText}>Student</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "professor" && styles.roleActive,
                ]}
                onPress={() => setRole("professor")}
              >
                <Text style={styles.roleText}>Professor</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
          <Text style={styles.primaryButtonText}>
            {isLogin ? "Login" : "Create Account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin
              ? "Don’t have an account? Sign up"
              : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    justifyContent: "center",
    padding: 22,
  },
  card: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 28,
    padding: 24,
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
    fontSize: 32,
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
  input: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 16,
    padding: 15,
    color: "#F8FAFC",
    marginBottom: 14,
  },
  roleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  roleButton: {
    flex: 1,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    padding: 14,
    borderRadius: 14,
  },
  roleActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  roleText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 16,
    marginTop: 6,
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