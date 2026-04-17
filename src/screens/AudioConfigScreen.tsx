import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useProjectStore } from '@/store/projectStore';

const VOICE_OPTIONS = [
  { id: 'male-1', icon: '👨', name: '男声', desc: '沉稳磁性' },
  { id: 'female-1', icon: '👩', name: '女声', desc: '温柔甜美' },
  { id: 'child-1', icon: '🧒', name: '童声', desc: '活泼可爱' },
];

const MUSIC_OPTIONS = [
  { id: 'ambient-1', name: '城市夜雨', mood: '沉思、孤独', duration: '2:30' },
  { id: 'electronic-1', name: '霓虹梦境', mood: '科技、未来', duration: '3:15' },
  { id: 'piano-1', name: '漫步午后', mood: '温暖、惬意', duration: '2:45' },
  { id: 'cinematic-1', name: '史诗之旅', mood: '壮阔、震撼', duration: '3:00' },
];

export const AudioConfigScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    currentProject,
    setVoiceConfig,
    setMusicConfig,
    startGeneration,
    isLoading,
  } = useProjectStore();

  const { voiceConfig, musicConfig } = currentProject;

  const handleVoiceToggle = () => {
    setVoiceConfig({ ...voiceConfig, enabled: !voiceConfig.enabled });
  };

  const handleVoiceSelect = (voiceId: string) => {
    setVoiceConfig({ ...voiceConfig, voiceId, enabled: true });
  };

  const handleMusicToggle = () => {
    setMusicConfig({ ...musicConfig, enabled: !musicConfig.enabled });
  };

  const handleMusicSelect = (musicId: string) => {
    setMusicConfig({ ...musicConfig, musicId, enabled: true });
  };

  const handleGenerate = async () => {
    try {
      const projectId = await startGeneration();
      (navigation as any).navigate('Progress', { projectId });
    } catch (err: any) {
      Alert.alert('错误', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step 4/4</Text>
          <Text style={styles.stepTitle}>配音与配乐</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎙️ AI 配音</Text>
            <TouchableOpacity
              style={[styles.toggle, voiceConfig.enabled && styles.toggleActive]}
              onPress={handleVoiceToggle}
            >
              <View
                style={[
                  styles.toggleThumb,
                  voiceConfig.enabled && styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          {voiceConfig.enabled && (
            <View style={styles.optionsRow}>
              {VOICE_OPTIONS.map((voice) => (
                <TouchableOpacity
                  key={voice.id}
                  style={[
                    styles.voiceOption,
                    voiceConfig.voiceId === voice.id && styles.voiceOptionSelected,
                  ]}
                  onPress={() => handleVoiceSelect(voice.id)}
                >
                  <Text style={styles.voiceIcon}>{voice.icon}</Text>
                  <Text style={styles.voiceName}>{voice.name}</Text>
                  <Text style={styles.voiceDesc}>{voice.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎵 背景音乐</Text>
            <TouchableOpacity
              style={[styles.toggle, musicConfig.enabled && styles.toggleActive]}
              onPress={handleMusicToggle}
            >
              <View
                style={[
                  styles.toggleThumb,
                  musicConfig.enabled && styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          {musicConfig.enabled && (
            <View style={styles.musicList}>
              {MUSIC_OPTIONS.map((music) => (
                <TouchableOpacity
                  key={music.id}
                  style={[
                    styles.musicOption,
                    musicConfig.musicId === music.id && styles.musicOptionSelected,
                  ]}
                  onPress={() => handleMusicSelect(music.id)}
                >
                  <View style={styles.musicInfo}>
                    <Text style={styles.musicName}>{music.name}</Text>
                    <Text style={styles.musicMood}>情绪：{music.mood}</Text>
                  </View>
                  <View style={styles.musicMeta}>
                    <Text style={styles.musicDuration}>{music.duration}</Text>
                    <TouchableOpacity style={styles.playButton}>
                      <Text style={styles.playIcon}>▶️</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {(voiceConfig.enabled || musicConfig.enabled) && (
          <Card style={styles.volumeCard}>
            <Text style={styles.volumeTitle}>🔊 音量比例</Text>
            {voiceConfig.enabled && (
              <View style={styles.volumeRow}>
                <Text style={styles.volumeLabel}>配音</Text>
                <View style={styles.volumeBar}>
                  <View style={[styles.volumeFill, { width: '70%' }]} />
                </View>
                <Text style={styles.volumeValue}>70%</Text>
              </View>
            )}
            {musicConfig.enabled && (
              <View style={styles.volumeRow}>
                <Text style={styles.volumeLabel}>音乐</Text>
                <View style={styles.volumeBar}>
                  <View style={[styles.volumeFill, { width: '40%' }]} />
                </View>
                <Text style={styles.volumeValue}>40%</Text>
              </View>
            )}
          </Card>
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          title="🎬 开始生成视频 (消耗1次)"
          onPress={handleGenerate}
          loading={isLoading}
          fullWidth
          size="large"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  stepIndicator: {
    marginBottom: 24,
  },
  stepText: {
    fontSize: 14,
    color: '#6B7280',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#6366F1',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  voiceOption: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  voiceOptionSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  voiceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  voiceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  voiceDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  musicList: {
    gap: 12,
  },
  musicOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  musicOptionSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  musicInfo: {
    flex: 1,
  },
  musicName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  musicMood: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  musicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  musicDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 12,
  },
  volumeCard: {
    marginTop: 16,
  },
  volumeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  volumeLabel: {
    width: 40,
    fontSize: 14,
    color: '#6B7280',
  },
  volumeBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  volumeValue: {
    width: 40,
    fontSize: 14,
    color: '#374151',
    textAlign: 'right',
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

export default AudioConfigScreen;
