import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Coffee, CreditCard, ArrowLeft } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { AuthContext } from '../../components/AuthProvider';
import * as SecureStore from 'expo-secure-store';

const QRCodeScreen: React.FC = () => {
  const auth = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const windowWidth = Dimensions.get('window').width;
  const cardWidth = Math.min(windowWidth * 0.92, 380); // tăng nhẹ chiều rộng cho card

  useEffect(() => {
    const getProfilePhone = async () => {
      try {
        const userData = await SecureStore.getItemAsync('user');
        if (userData) {
          const profile = JSON.parse(userData);
          if (profile.phone) {
            setPhone(profile.phone);
            return;
          }
        }
        if (auth?.user?.phone) {
          setPhone(auth.user.phone);
        } else {
          setPhone('No phone');
        }
      } catch {
        setPhone('No phone');
      }
    };
    getProfilePhone();
  }, [auth?.user]);

  return (
    <View style={styles.overlay}>
      {/* Header BrewPass icon and text, moved down and larger */}
      <View style={styles.headerIconWrap}>
        <Coffee size={32} color="#B08968" style={{ marginRight: 10 }} />
        <Text style={styles.headerTitle}>BrewPass</Text>
      </View>

      <View style={styles.centerContent}>
        {/* Small rounded title card */}
        <LinearGradient
          colors={["#D6B59F", "#B17F60", "#8D5B3F"]}
          start={{ x: 0.0, y: 1.0 }}
          end={{ x: 0.0, y: 0.0 }}
          style={[styles.titleCard, { width: cardWidth }]}
        >
          <Text style={styles.cardTitle}>Premium Daily Brew</Text>
          <Text style={styles.plainRemaining}>Remaining: 15 Drinks</Text>
        </LinearGradient>

        {/* QR block: moved down from title card */}
        <View style={[styles.qrShadowWrap, { width: cardWidth }]}> 
          <View style={styles.qrOuter}> 
            <View style={styles.qrInnerBox}>
              {/* corner markers (subtle) */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              {phone && phone !== '' && phone !== 'No phone' ? (
                <View style={styles.qrInnerWrap}>
                  <QRCode
                    value={phone}
                    size={150} // Increased QR code size
                    backgroundColor="#fff"
                    color="#000000"
                    quietZone={8}
                  />
                  <View style={styles.qrCenterIcon}>
                    <Text style={styles.xMark}>×</Text>
                  </View>
                </View>
              ) : (
                <Text style={{ color: '#B08968', fontWeight: '700', fontSize: 16 }}>
                  Không có số điện thoại
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.qrLabel}>QR Code</Text>
        </View>

        {/* Action buttons row */}
        <View style={styles.actionRow}>
          <View style={styles.actionButtonWrap}>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonLeft]}>
              <Calendar color="#2AB27B" size={24} /> 
            </TouchableOpacity>
            <Text style={[styles.actionText, styles.actionTextLeft]}>View History</Text>
          </View>

          <View style={styles.actionButtonWrap}>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonCenter]}>
              <Coffee color="#B08968" size={24} />
            </TouchableOpacity>
            <Text style={[styles.actionText, styles.actionTextCenter]}>Pre-Order Drinks</Text>
          </View>

          <View style={styles.actionButtonWrap}>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonRight]}>
              <CreditCard color="#4E342E" size={24} />
            </TouchableOpacity>
            <Text style={[styles.actionText, styles.actionTextRight]}>Manage Payment</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 38,
    marginBottom: 6,
    width: '100%',
    position: 'absolute', // Make it absolute positioned
    top: 0,               // Position at the top
    zIndex: 10,           // Ensure it stays on top
  },
  backButton: {
    position: 'absolute',
    left: 14,
    top: 6,
    width: 36,
    height: 36,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 18,
    width: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4E342E',
    textAlign: 'center',
  },
  centerContent: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 0, // Remove padding as we're using justifyContent
    flex: 1,
    justifyContent: 'center', // Center vertically in the available space
  },

  /* title card */
  titleCard: {
    borderRadius: 32, // bo tròn nhiều hơn
    paddingTop: 32,
    paddingBottom: 60, // vừa đủ để QR chồng lên
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 0,
    shadowColor: '#8D5B3F',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    zIndex: 1,
    height: 180, // card lớn hơn, giống ảnh
  },
  cardTitle: {
    fontSize: 22, // Larger font
    fontWeight: '600', // Slightly bolder
    color: '#fff',
    textAlign: 'center',
    marginTop: 0,
  },
  quotaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
  },
  plainRemaining: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 35, // Add significant bottom margin to push text up in card
    opacity: 0.9,
  },
  badgeContainer: {
    backgroundColor: '#2AB27B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 6,
  },
  badgeText: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 12,
  },

  /* QR outer frame */
  qrShadowWrap: {
    alignItems: 'center',
    marginTop: -50, // QR chồng lên dưới card, lên trên một chút
    marginBottom: 5,
    zIndex: 2,
  },
  qrOuter: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  qrInnerBox: {
    width: 200,
    height: 200,
    borderRadius: 24,
    backgroundColor: '#fff',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    marginTop: 0,
  },
  qrInnerWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCenterIcon: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30, // Larger center icon
    height: 30, // Larger center icon
    borderRadius: 15,
  },
  xMark: {
    fontSize: 24, // Larger X
    fontWeight: '300',
    color: '#2AB27B',
    lineHeight: 24,
  },
  qrLabel: {
    fontSize: 14, // Larger label text
    color: '#4E342E',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12, // More spacing
    marginBottom: 12,
  },

  /* corner markers */
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    backgroundColor: 'transparent',
    borderColor: '#4E342E',
  },
  cornerTL: {
    top: 6,
    left: 6,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 6,
    right: 6,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 6,
    left: 6,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 6,
    right: 6,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderBottomRightRadius: 10,
  },

  /* actions */
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    marginTop: 20, // Less space needed since QR is lower now
    marginBottom: 15,
    paddingHorizontal: 25,
  },
  actionButtonWrap: {
    alignItems: 'center',
    flex: 1,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 60,
    width: 60, // Larger buttons
    height: 60, // Larger buttons
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5D3B3',
    marginBottom: 8, // More spacing below
  },
  actionButtonLeft: {
    borderColor: '#2AB27B',
    borderWidth: 1,
  },
  actionButtonCenter: {
    borderColor: '#B08968',
    borderWidth: 1,
  },
  actionButtonRight: {
    borderColor: '#4E342E',
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12, // Larger text
    marginTop: 4, // More spacing
    textAlign: 'center',
    fontWeight: '500', // Slightly bolder
    maxWidth: 80,
  },
  actionTextLeft: {
    color: '#2AB27B',
  },
  actionTextCenter: {
    color: '#B08968',
    fontWeight: '600',
  },
  actionTextRight: {
    color: '#4E342E',
  },
});

export default QRCodeScreen;
