import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Colors } from "../../../constants/colors";

interface SuccessfullyProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

export default function Successfully({ visible, onClose, navigation }: SuccessfullyProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/845/845646.png" }}
            style={styles.icon}
          />
          <Text style={styles.title}>Thanh toán thành công!</Text>
          <Text style={styles.desc}>Cảm ơn bạn đã đăng ký subscription. Đơn hàng đã được kích hoạt.</Text>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => {
              onClose();
              navigation.navigate("MainTabs", { screen: "Home" });
            }}
          >
            <Text style={styles.homeBtnText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    width: 320,
    elevation: 10,
  },
  icon: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  desc: {
    fontSize: 15,
    color: Colors.gray[700],
    textAlign: "center",
    marginBottom: 18,
  },
  homeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  homeBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});