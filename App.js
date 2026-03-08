/**
 * ============================================================================
 * ZenFocus: Minimalist Verimlilik Sayacı
 * ============================================================================
 * 
 * Sürüm: 1.0.0
 * Platform: Android (React Native / Expo)
 * Hedef SDK: 35 (Android 15)
 * Minimum SDK: 24 (Android 7.0)
 * 
 * UYUMLULUK NOTLARI - Android 15 (API 35):
 * ------------------------------------------
 * 1. Edge-to-Edge Display: Android 15 varsayılan olarak edge-to-edge 
 *    zorunlu kılar. SafeAreaView ve StatusBar padding'leri ile uyumlu.
 * 2. Predictive Back Gesture: Bu uygulama tek ekranlı olduğu için
 *    geri tuşu doğrudan uygulamayı kapatır, ek işlem gerekmez.
 * 3. Foreground Service Kısıtlamaları: Timer yalnızca uygulama ön
 *    plandayken çalışır, foreground service kullanılmaz.
 * 4. Non-SDK Interface Kısıtlamaları: Yalnızca Expo standart API'leri
 *    kullanılır, non-SDK arayüz çağrısı yoktur.
 * 5. 16KB Page Size Uyumluluğu: Expo SDK 52+ native kütüphaneleri
 *    16KB page size ile uyumludur.
 * 6. Veri Güvenliği: Hiçbir kullanıcı verisi toplanmaz, paylaşılmaz
 *    veya dışarı aktarılmaz. Tüm veriler AsyncStorage ile cihaz
 *    üzerinde saklanır.
 * 
 * KULLANILAN TEKNOLOJİLER (Sadece standart Expo paketleri):
 * - React Native (Expo SDK 52)
 * - AsyncStorage (@react-native-async-storage/async-storage — Expo ile gelir)
 * - Expo StatusBar
 * - Expo Haptics (Titreşim geri bildirimi)
 * - Expo Audio (Bildirim sesi)
 * - Expo LinearGradient
 * 
 * Hiçbir harici API anahtarı veya üçüncü parti servis kullanılmaz.
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  Modal,
  Alert,
  Vibration,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

// ============================================================================
// SABITLER
// ============================================================================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const STORAGE_KEYS = {
  TASKS: '@zenfocus_tasks',
  STATS: '@zenfocus_stats',
  SETTINGS: '@zenfocus_settings',
};

// Pomodoro varsayılan süreleri (saniye)
const DEFAULT_WORK_TIME = 25 * 60;       // 25 dakika
const DEFAULT_SHORT_BREAK = 5 * 60;      // 5 dakika
const DEFAULT_LONG_BREAK = 15 * 60;      // 15 dakika
const POMODOROS_BEFORE_LONG = 4;

// Renk paleti - Dark Glassmorphism
const COLORS = {
  // Ana arkaplan
  bgPrimary: '#0a0a1a',
  bgSecondary: '#12122a',
  bgTertiary: '#1a1a3e',

  // Glassmorphism
  glassLight: 'rgba(255, 255, 255, 0.06)',
  glassMedium: 'rgba(255, 255, 255, 0.10)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassHighlight: 'rgba(255, 255, 255, 0.18)',

  // Accent renkler
  accentPrimary: '#7c5cfc',
  accentSecondary: '#00d4aa',
  accentWarning: '#ffb347',
  accentDanger: '#ff6b6b',
  accentInfo: '#54a0ff',

  // Gradyanlar
  gradientPurple: ['#7c5cfc', '#b44cff'],
  gradientGreen: ['#00d4aa', '#00f5c8'],
  gradientOrange: ['#ffb347', '#ff6b6b'],
  gradientBlue: ['#54a0ff', '#7c5cfc'],
  gradientBg: ['#0a0a1a', '#12122a', '#1a1a3e'],

  // Metin
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  textDark: '#0a0a1a',
};

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

// ============================================================================
// GLASSMORPHISM KART BİLEŞENİ
// ============================================================================
const GlassCard = ({ children, style, intensity = 'light' }) => {
  const bgColor = intensity === 'medium' ? COLORS.glassMedium : COLORS.glassLight;
  return (
    <View style={[styles.glassCard, { backgroundColor: bgColor }, style]}>
      {children}
    </View>
  );
};

// ============================================================================
// DAIRESEL İLERLEME GÖSTERGESİ (SVG-siz, saf View ile)
// ============================================================================
const CircularProgress = ({ progress, size = 240, strokeWidth = 8, children }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Arka plan halka */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: COLORS.glassLight,
        }}
      />
      {/* İlerleme göstergesi - glassmorphism halka */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth + 2,
          borderColor: 'transparent',
          borderTopColor: COLORS.accentPrimary,
          borderRightColor: progress > 0.25 ? COLORS.accentPrimary : 'transparent',
          borderBottomColor: progress > 0.5 ? COLORS.accentPrimary : 'transparent',
          borderLeftColor: progress > 0.75 ? COLORS.accentPrimary : 'transparent',
          transform: [{ rotate: '-90deg' }],
          opacity: 0.9,
        }}
      />
      {/* Parlak glow efekti */}
      <View
        style={{
          position: 'absolute',
          width: size + 20,
          height: size + 20,
          borderRadius: (size + 20) / 2,
          borderWidth: 1,
          borderColor: `rgba(124, 92, 252, ${0.15 * progress})`,
        }}
      />
      {/* İçerik */}
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        {children}
      </View>
    </View>
  );
};

// ============================================================================
// TAB NAVIGASYON BİLEŞENİ
// ============================================================================
const TabBar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'timer', icon: '⏱', label: 'Zamanlayıcı' },
    { key: 'tasks', icon: '📋', label: 'Görevler' },
    { key: 'stats', icon: '📊', label: 'İstatistik' },
  ];

  return (
    <GlassCard style={styles.tabBar} intensity="medium">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabItem,
            activeTab === tab.key && styles.tabItemActive,
          ]}
          onPress={() => {
            onTabChange(tab.key);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text
            style={[
              styles.tabLabel,
              activeTab === tab.key && styles.tabLabelActive,
            ]}
          >
            {tab.label}
          </Text>
          {activeTab === tab.key && (
            <View style={styles.tabIndicator} />
          )}
        </TouchableOpacity>
      ))}
    </GlassCard>
  );
};

// ============================================================================
// POMODORO ZAMANLAYICI BİLEŞENİ
// ============================================================================
const PomodoroTimer = ({ onPomodoroComplete, todayStats, setTodayStats }) => {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORK_TIME);
  const [totalTime, setTotalTime] = useState(DEFAULT_WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  const intervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Nabız animasyonu
  useEffect(() => {
    if (isRunning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();

      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
        ])
      );
      glow.start();

      return () => {
        pulse.stop();
        glow.stop();
      };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isRunning]);

  // Zamanlayıcı
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Titreşim ile bildirim
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (mode === 'work') {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);

      // İstatistikleri güncelle
      const newStats = {
        ...todayStats,
        completedPomodoros: (todayStats.completedPomodoros || 0) + 1,
        totalFocusMinutes: (todayStats.totalFocusMinutes || 0) + workDuration,
      };
      setTodayStats(newStats);
      await saveStats(newStats);

      if (onPomodoroComplete) onPomodoroComplete();

      // Uzun mola mı kısa mola mı?
      if (newCount % POMODOROS_BEFORE_LONG === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('work');
    }
  };

  const saveStats = async (stats) => {
    try {
      const today = getToday();
      const allStatsRaw = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
      const allStats = allStatsRaw ? JSON.parse(allStatsRaw) : {};
      allStats[today] = stats;
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(allStats));
    } catch (e) {
      console.log('Stats kaydetme hatası:', e);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    let duration;
    switch (newMode) {
      case 'work':
        duration = workDuration * 60;
        break;
      case 'shortBreak':
        duration = shortBreakDuration * 60;
        break;
      case 'longBreak':
        duration = longBreakDuration * 60;
        break;
      default:
        duration = workDuration * 60;
    }
    setTimeLeft(duration);
    setTotalTime(duration);
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    switchMode(mode);
  };

  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;

  const getModeInfo = () => {
    switch (mode) {
      case 'work':
        return { label: 'Odaklan', emoji: '🎯', gradient: COLORS.gradientPurple };
      case 'shortBreak':
        return { label: 'Kısa Mola', emoji: '☕', gradient: COLORS.gradientGreen };
      case 'longBreak':
        return { label: 'Uzun Mola', emoji: '🌿', gradient: COLORS.gradientBlue };
      default:
        return { label: 'Odaklan', emoji: '🎯', gradient: COLORS.gradientPurple };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <View style={styles.timerContainer}>
      {/* Mod etiketleri */}
      <View style={styles.modeSelector}>
        {[
          { key: 'work', label: 'Odaklan', emoji: '🎯' },
          { key: 'shortBreak', label: 'Kısa Mola', emoji: '☕' },
          { key: 'longBreak', label: 'Uzun Mola', emoji: '🌿' },
        ].map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeButton, mode === m.key && styles.modeButtonActive]}
            onPress={() => {
              if (!isRunning) {
                switchMode(m.key);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            disabled={isRunning}
            activeOpacity={0.7}
          >
            <Text style={styles.modeEmoji}>{m.emoji}</Text>
            <Text style={[styles.modeLabel, mode === m.key && styles.modeLabelActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ana zamanlayıcı */}
      <Animated.View style={[styles.timerCircleWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <CircularProgress progress={progress} size={SCREEN_WIDTH * 0.65}>
          <Text style={styles.timerModeEmoji}>{modeInfo.emoji}</Text>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.timerSubText}>{modeInfo.label}</Text>
        </CircularProgress>
      </Animated.View>

      {/* Pomodoro sayacı */}
      <View style={styles.pomodoroIndicator}>
        {[...Array(4)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.pomodoroDot,
              i < (pomodoroCount % 4) && styles.pomodoroDotFilled,
            ]}
          />
        ))}
        <Text style={styles.pomodoroCountText}>
          {pomodoroCount} pomodoro tamamlandı
        </Text>
      </View>

      {/* Kontrol butonları */}
      <View style={styles.controlButtons}>
        <TouchableOpacity style={styles.secondaryButton} onPress={resetTimer} activeOpacity={0.7}>
          <Text style={styles.secondaryButtonText}>↺ Sıfırla</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleTimer} activeOpacity={0.8}>
          <LinearGradient
            colors={isRunning ? COLORS.gradientOrange : modeInfo.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {isRunning ? '⏸  Duraklat' : '▶  Başlat'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setShowSettings(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>⚙ Ayarlar</Text>
        </TouchableOpacity>
      </View>

      {/* Günlük özet */}
      <GlassCard style={styles.dailySummary} intensity="medium">
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{todayStats.completedPomodoros || 0}</Text>
            <Text style={styles.summaryLabel}>Pomodoro</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{todayStats.totalFocusMinutes || 0}</Text>
            <Text style={styles.summaryLabel}>Dakika Odak</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{todayStats.completedTasks || 0}</Text>
            <Text style={styles.summaryLabel}>Görev</Text>
          </View>
        </View>
      </GlassCard>

      {/* Ayarlar Modal */}
      <Modal visible={showSettings} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.settingsModal} intensity="medium">
            <Text style={styles.settingsTitle}>⚙ Zamanlayıcı Ayarları</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Odaklanma Süresi (dk)</Text>
              <View style={styles.settingControl}>
                <TouchableOpacity
                  style={styles.settingBtn}
                  onPress={() => setWorkDuration(Math.max(1, workDuration - 5))}
                >
                  <Text style={styles.settingBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.settingValue}>{workDuration}</Text>
                <TouchableOpacity
                  style={styles.settingBtn}
                  onPress={() => setWorkDuration(Math.min(60, workDuration + 5))}
                >
                  <Text style={styles.settingBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Kısa Mola (dk)</Text>
              <View style={styles.settingControl}>
                <TouchableOpacity
                  style={styles.settingBtn}
                  onPress={() => setShortBreakDuration(Math.max(1, shortBreakDuration - 1))}
                >
                  <Text style={styles.settingBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.settingValue}>{shortBreakDuration}</Text>
                <TouchableOpacity
                  style={styles.settingBtn}
                  onPress={() => setShortBreakDuration(Math.min(30, shortBreakDuration + 1))}
                >
                  <Text style={styles.settingBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Uzun Mola (dk)</Text>
              <View style={styles.settingControl}>
                <TouchableOpacity
                  style={styles.settingBtn}
                  onPress={() => setLongBreakDuration(Math.max(5, longBreakDuration - 5))}
                >
                  <Text style={styles.settingBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.settingValue}>{longBreakDuration}</Text>
                <TouchableOpacity
                  style={styles.settingBtn}
                  onPress={() => setLongBreakDuration(Math.min(45, longBreakDuration + 5))}
                >
                  <Text style={styles.settingBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setShowSettings(false);
                if (!isRunning) {
                  switchMode(mode);
                }
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.gradientPurple}
                style={styles.settingsSaveBtn}
              >
                <Text style={styles.settingsSaveBtnText}>Kaydet ve Kapat</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
};

// ============================================================================
// GÖREV LİSTESİ BİLEŞENİ
// ============================================================================
const TaskList = ({ todayStats, setTodayStats }) => {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  // Görevleri yükle
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (raw) {
        const allTasks = JSON.parse(raw);
        setTasks(allTasks);
      }
    } catch (e) {
      console.log('Görev yükleme hatası:', e);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
    } catch (e) {
      console.log('Görev kaydetme hatası:', e);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newTask = {
      id: generateId(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      date: getToday(),
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    setNewTaskText('');
  };

  const toggleTask = async (taskId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        const wasCompleted = t.completed;
        if (!wasCompleted) {
          // Görev tamamlandı - stats güncelle
          const newStats = {
            ...todayStats,
            completedTasks: (todayStats.completedTasks || 0) + 1,
          };
          setTodayStats(newStats);
          saveStatsToStorage(newStats);
        } else {
          // Görev geri alındı
          const newStats = {
            ...todayStats,
            completedTasks: Math.max(0, (todayStats.completedTasks || 0) - 1),
          };
          setTodayStats(newStats);
          saveStatsToStorage(newStats);
        }
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const saveStatsToStorage = async (stats) => {
    try {
      const today = getToday();
      const allStatsRaw = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
      const allStats = allStatsRaw ? JSON.parse(allStatsRaw) : {};
      allStats[today] = stats;
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(allStats));
    } catch (e) {
      console.log('Stats kaydetme hatası:', e);
    }
  };

  const deleteTask = async (taskId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Görevi Sil',
      'Bu görevi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const updatedTasks = tasks.filter((t) => t.id !== taskId);
            setTasks(updatedTasks);
            await saveTasks(updatedTasks);
          },
        },
      ]
    );
  };

  const startEditing = (task) => {
    setEditingTask(task.id);
    setEditText(task.text);
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;
    const updatedTasks = tasks.map((t) =>
      t.id === editingTask ? { ...t, text: editText.trim() } : t
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    setEditingTask(null);
    setEditText('');
  };

  const clearCompleted = async () => {
    const activeTasks = tasks.filter((t) => !t.completed);
    setTasks(activeTasks);
    await saveTasks(activeTasks);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const todayTasks = filteredTasks.filter((t) => t.date === getToday());
  const olderTasks = filteredTasks.filter((t) => t.date !== getToday());

  const renderTask = ({ item }) => (
    <GlassCard style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
      <TouchableOpacity
        style={styles.taskCheckbox}
        onPress={() => toggleTask(item.id)}
        activeOpacity={0.6}
      >
        <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <View style={styles.taskContent}>
        {editingTask === item.id ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              onSubmitEditing={saveEdit}
              autoFocus
              placeholderTextColor={COLORS.textMuted}
            />
            <TouchableOpacity onPress={saveEdit} style={styles.editSaveBtn}>
              <Text style={styles.editSaveBtnText}>✓</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onLongPress={() => startEditing(item)} activeOpacity={0.8}>
            <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
              {item.text}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.taskDeleteBtn}
        onPress={() => deleteTask(item.id)}
        activeOpacity={0.6}
      >
        <Text style={styles.taskDeleteText}>✕</Text>
      </TouchableOpacity>
    </GlassCard>
  );

  return (
    <KeyboardAvoidingView
      style={styles.taskContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Yeni görev ekleme */}
      <GlassCard style={styles.addTaskCard} intensity="medium">
        <TextInput
          style={styles.addTaskInput}
          placeholder="Yeni görev ekle..."
          placeholderTextColor={COLORS.textMuted}
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={addTask} activeOpacity={0.8}>
          <LinearGradient
            colors={COLORS.gradientPurple}
            style={styles.addTaskBtn}
          >
            <Text style={styles.addTaskBtnText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>

      {/* Filtre butonları */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'active', label: 'Aktif' },
          { key: 'completed', label: 'Bitti' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        {tasks.some((t) => t.completed) && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearCompleted}>
            <Text style={styles.clearBtnText}>Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Görev sayısı */}
      <View style={styles.taskCountRow}>
        <Text style={styles.taskCountText}>
          {tasks.filter((t) => !t.completed).length} aktif görev
        </Text>
        <Text style={styles.taskCountDot}>•</Text>
        <Text style={styles.taskCountText}>
          {tasks.filter((t) => t.completed).length} tamamlandı
        </Text>
      </View>

      {/* Görev listesi */}
      <FlatList
        data={[
          ...(todayTasks.length > 0 ? [{ id: '__header_today', isHeader: true, title: '📅 Bugün' }] : []),
          ...todayTasks,
          ...(olderTasks.length > 0 ? [{ id: '__header_older', isHeader: true, title: '📁 Önceki Görevler' }] : []),
          ...olderTasks,
        ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.isHeader) {
            return (
              <Text style={styles.sectionHeader}>{item.title}</Text>
            );
          }
          return renderTask({ item });
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.taskList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>Henüz görev yok</Text>
            <Text style={styles.emptySubText}>Yukarıdan yeni görev ekleyebilirsiniz</Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
};

// ============================================================================
// İSTATİSTİK BİLEŞENİ
// ============================================================================
const StatsScreen = ({ todayStats }) => {
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalPomodoros: 0,
    totalMinutes: 0,
    totalTasks: 0,
    streakDays: 0,
  });

  useEffect(() => {
    loadWeeklyStats();
  }, [todayStats]);

  const loadWeeklyStats = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
      const allStats = raw ? JSON.parse(raw) : {};

      // Son 7 gün
      const days = [];
      const dayLabels = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      let totalP = 0, totalM = 0, totalT = 0, streak = 0;
      let streakBroken = false;

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        const stat = allStats[key] || { completedPomodoros: 0, totalFocusMinutes: 0, completedTasks: 0 };

        days.push({
          label: dayLabels[d.getDay()],
          pomodoros: stat.completedPomodoros || 0,
          minutes: stat.totalFocusMinutes || 0,
          tasks: stat.completedTasks || 0,
          isToday: i === 0,
        });

        totalP += stat.completedPomodoros || 0;
        totalM += stat.totalFocusMinutes || 0;
        totalT += stat.completedTasks || 0;
      }

      // Streak hesapla
      const sortedDates = Object.keys(allStats).sort().reverse();
      for (const dateKey of sortedDates) {
        const stat = allStats[dateKey];
        if ((stat.completedPomodoros || 0) > 0) {
          streak++;
        } else {
          break;
        }
      }

      setWeeklyStats(days);
      setTotalStats({
        totalPomodoros: totalP,
        totalMinutes: totalM,
        totalTasks: totalT,
        streakDays: streak,
      });
    } catch (e) {
      console.log('Stats yükleme hatası:', e);
    }
  };

  const maxPomodoros = Math.max(1, ...weeklyStats.map((d) => d.pomodoros));

  return (
    <ScrollView style={styles.statsContainer} showsVerticalScrollIndicator={false}>
      {/* Bugünün özeti */}
      <Text style={styles.statsTitle}>📊 İstatistikler</Text>

      <View style={styles.statsGrid}>
        <GlassCard style={styles.statCard}>
          <LinearGradient colors={COLORS.gradientPurple} style={styles.statIconBg}>
            <Text style={styles.statIcon}>🎯</Text>
          </LinearGradient>
          <Text style={styles.statValue}>{todayStats.completedPomodoros || 0}</Text>
          <Text style={styles.statLabel}>Bugün Pomodoro</Text>
        </GlassCard>

        <GlassCard style={styles.statCard}>
          <LinearGradient colors={COLORS.gradientGreen} style={styles.statIconBg}>
            <Text style={styles.statIcon}>⏱</Text>
          </LinearGradient>
          <Text style={styles.statValue}>{todayStats.totalFocusMinutes || 0}</Text>
          <Text style={styles.statLabel}>Dakika Odak</Text>
        </GlassCard>

        <GlassCard style={styles.statCard}>
          <LinearGradient colors={COLORS.gradientOrange} style={styles.statIconBg}>
            <Text style={styles.statIcon}>✅</Text>
          </LinearGradient>
          <Text style={styles.statValue}>{todayStats.completedTasks || 0}</Text>
          <Text style={styles.statLabel}>Görev Tamam</Text>
        </GlassCard>

        <GlassCard style={styles.statCard}>
          <LinearGradient colors={COLORS.gradientBlue} style={styles.statIconBg}>
            <Text style={styles.statIcon}>🔥</Text>
          </LinearGradient>
          <Text style={styles.statValue}>{totalStats.streakDays}</Text>
          <Text style={styles.statLabel}>Gün Serisi</Text>
        </GlassCard>
      </View>

      {/* Haftalık grafik */}
      <GlassCard style={styles.weeklyCard} intensity="medium">
        <Text style={styles.weeklyTitle}>📈 Haftalık Pomodoro Grafiği</Text>
        <View style={styles.chartContainer}>
          {weeklyStats.map((day, index) => (
            <View key={index} style={styles.chartBar}>
              <Text style={styles.chartValue}>{day.pomodoros}</Text>
              <View style={styles.chartBarTrack}>
                <LinearGradient
                  colors={day.isToday ? COLORS.gradientPurple : [COLORS.glassMedium, COLORS.glassHighlight]}
                  style={[
                    styles.chartBarFill,
                    {
                      height: `${Math.max(5, (day.pomodoros / maxPomodoros) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.chartLabel, day.isToday && styles.chartLabelActive]}>
                {day.label}
              </Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Toplam istatistikler */}
      <GlassCard style={styles.totalStatsCard} intensity="medium">
        <Text style={styles.totalStatsTitle}>🏆 Haftalık Toplam</Text>
        <View style={styles.totalStatsRow}>
          <View style={styles.totalStatItem}>
            <Text style={styles.totalStatValue}>{totalStats.totalPomodoros}</Text>
            <Text style={styles.totalStatLabel}>Pomodoro</Text>
          </View>
          <View style={styles.totalStatDivider} />
          <View style={styles.totalStatItem}>
            <Text style={styles.totalStatValue}>{totalStats.totalMinutes}</Text>
            <Text style={styles.totalStatLabel}>Dakika</Text>
          </View>
          <View style={styles.totalStatDivider} />
          <View style={styles.totalStatItem}>
            <Text style={styles.totalStatValue}>{totalStats.totalTasks}</Text>
            <Text style={styles.totalStatLabel}>Görev</Text>
          </View>
        </View>
      </GlassCard>

      {/* Motivasyon kartı */}
      <GlassCard style={styles.motivationCard} intensity="medium">
        <Text style={styles.motivationEmoji}>
          {todayStats.completedPomodoros >= 8
            ? '🌟'
            : todayStats.completedPomodoros >= 4
            ? '💪'
            : todayStats.completedPomodoros >= 1
            ? '🚀'
            : '🌱'}
        </Text>
        <Text style={styles.motivationText}>
          {todayStats.completedPomodoros >= 8
            ? 'Muhteşem bir gün! Sen bir odaklanma ustasısın!'
            : todayStats.completedPomodoros >= 4
            ? 'Harika gidiyorsun! Devam et!'
            : todayStats.completedPomodoros >= 1
            ? 'Güzel başlangıç! Bir sonraki Pomodoro seni bekliyor.'
            : 'Bugün harika bir gün olacak. İlk Pomodoro\'nu başlat!'}
        </Text>
      </GlassCard>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// ============================================================================
// ANA UYGULAMA BİLEŞENİ
// ============================================================================
export default function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [todayStats, setTodayStats] = useState({
    completedPomodoros: 0,
    totalFocusMinutes: 0,
    completedTasks: 0,
  });

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Uygulama açılışında istatistikleri yükle
  useEffect(() => {
    loadTodayStats();
  }, []);

  const loadTodayStats = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
      if (raw) {
        const allStats = JSON.parse(raw);
        const today = getToday();
        if (allStats[today]) {
          setTodayStats(allStats[today]);
        }
      }
    } catch (e) {
      console.log('İstatistik yükleme hatası:', e);
    }
  };

  const handleTabChange = (tab) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'timer':
        return (
          <PomodoroTimer
            onPomodoroComplete={() => {}}
            todayStats={todayStats}
            setTodayStats={setTodayStats}
          />
        );
      case 'tasks':
        return (
          <TaskList todayStats={todayStats} setTodayStats={setTodayStats} />
        );
      case 'stats':
        return <StatsScreen todayStats={todayStats} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgPrimary} translucent={false} />
      <LinearGradient colors={COLORS.gradientBg} style={styles.gradient}>
        {/* Dekoratif arka plan öğeleri */}
        <View style={styles.bgOrb1} />
        <View style={styles.bgOrb2} />
        <View style={styles.bgOrb3} />

        <SafeAreaView style={styles.safeArea}>
          {/* Başlık */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>ZenFocus</Text>
            <Text style={styles.headerSubtitle}>Minimalist Verimlilik</Text>
          </View>

          {/* İçerik */}
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {renderContent()}
          </Animated.View>

          {/* Tab Bar */}
          <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

// ============================================================================
// STİLLER
// ============================================================================
const styles = StyleSheet.create({
  // === LAYOUT ===
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  content: {
    flex: 1,
  },

  // === DEKORATIF ARKA PLAN ===
  bgOrb1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(124, 92, 252, 0.08)',
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 100,
    left: -120,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 212, 170, 0.06)',
  },
  bgOrb3: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.4,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 179, 71, 0.05)',
  },

  // === HEADER ===
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },

  // === GLASS CARD ===
  glassCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },

  // === TAB BAR ===
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'android' ? 12 : 28,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    position: 'relative',
  },
  tabItemActive: {
    backgroundColor: COLORS.glassHighlight,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: COLORS.textPrimary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.accentPrimary,
  },

  // === POMODORO TIMER ===
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.glassLight,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  modeButtonActive: {
    borderColor: COLORS.accentPrimary,
    backgroundColor: 'rgba(124, 92, 252, 0.15)',
  },
  modeEmoji: {
    fontSize: 14,
  },
  modeLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  modeLabelActive: {
    color: COLORS.textPrimary,
  },

  timerCircleWrapper: {
    marginVertical: 16,
  },
  timerModeEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  timerText: {
    fontSize: 52,
    fontWeight: '200',
    color: COLORS.textPrimary,
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  },
  timerSubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },

  // === POMODORO DOTS ===
  pomodoroIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  pomodoroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.glassLight,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
  },
  pomodoroDotFilled: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  pomodoroCountText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 4,
  },

  // === BUTONLAR ===
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 8,
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: COLORS.glassLight,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  secondaryButtonText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // === GÜNLÜK ÖZET ===
  dailySummary: {
    width: '100%',
    padding: 16,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.glassBorder,
  },

  // === AYARLAR MODAL ===
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  settingsModal: {
    width: '100%',
    padding: 24,
    backgroundColor: COLORS.bgSecondary,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.glassMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  settingBtnText: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    width: 40,
    textAlign: 'center',
  },
  settingsSaveBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  settingsSaveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // === GÖREV LİSTESİ ===
  taskContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  addTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    marginBottom: 12,
  },
  addTaskInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  addTaskBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTaskBtnText: {
    fontSize: 24,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  // === FİLTRE ===
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.glassLight,
  },
  filterBtnActive: {
    backgroundColor: 'rgba(124, 92, 252, 0.2)',
  },
  filterLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  filterLabelActive: {
    color: COLORS.accentPrimary,
  },
  clearBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearBtnText: {
    fontSize: 12,
    color: COLORS.accentDanger,
    fontWeight: '600',
  },

  taskCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  taskCountText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  taskCountDot: {
    color: COLORS.textMuted,
    fontSize: 8,
  },

  // === GÖREV KARTI ===
  taskList: {
    paddingBottom: 20,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  taskCheckbox: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.accentSecondary,
    borderColor: COLORS.accentSecondary,
  },
  checkmark: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '800',
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  taskDeleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  taskDeleteText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },

  // === DÜZENLEME ===
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accentPrimary,
    paddingVertical: 4,
  },
  editSaveBtn: {
    padding: 8,
    marginLeft: 8,
  },
  editSaveBtnText: {
    fontSize: 18,
    color: COLORS.accentSecondary,
    fontWeight: '700',
  },

  // === SECTION HEADER ===
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  // === EMPTY STATE ===
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptySubText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // === İSTATİSTİKLER ===
  statsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    padding: 16,
    alignItems: 'center',
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },

  // === HAFTALIK GRAFİK ===
  weeklyCard: {
    padding: 20,
    marginBottom: 16,
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartValue: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  chartBarTrack: {
    width: 24,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.glassLight,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 12,
    minHeight: 5,
  },
  chartLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  chartLabelActive: {
    color: COLORS.accentPrimary,
    fontWeight: '700',
  },

  // === TOPLAM İSTATİSTİKLER ===
  totalStatsCard: {
    padding: 20,
    marginBottom: 16,
  },
  totalStatsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  totalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  totalStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  totalStatValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  totalStatLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  totalStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.glassBorder,
  },

  // === MOTİVASYON ===
  motivationCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  motivationEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  motivationText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});
