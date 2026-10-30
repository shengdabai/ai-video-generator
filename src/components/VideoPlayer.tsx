/**
 * VideoPlayer
 * Thin wrapper around expo-video (replaces the removed expo-av `Video`).
 *
 * Behaviour kept from the expo-av version:
 * - native playback controls, `contain` fit
 * - no autoplay, no loop, sound on (expo-video player defaults)
 * - `onError` fires when the player reports the `error` status
 */
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

export interface VideoPlayerProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
  onError?: (message: string | undefined) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ uri, style, onError }) => {
  const player = useVideoPlayer(uri);

  useEventListener(player, 'statusChange', ({ status, error }) => {
    if (status === 'error') onError?.(error?.message);
  });

  return <VideoView player={player} style={style} nativeControls contentFit="contain" />;
};

export default VideoPlayer;
