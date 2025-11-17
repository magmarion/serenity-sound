import React, { useEffect, useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // 0-1

  async function playSound() {
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: 'https://www.orangefreesounds.com/wp-content/uploads/2014/09/Rain-sound.mp3' },
      { shouldPlay: true, volume }
    );

    setSound(newSound);
    setIsPlaying(true);
  }


  async function pauseSound() {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  }

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  useEffect(() => {
    if (sound && (sound as any)._loaded) {
      sound.setVolumeAsync(volume);
    }
  }, [volume, sound]);


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<View style={{ height: 250, backgroundColor: 'lightblue' }} />}>
      <View style={styles.container}>
        <ThemedText type="title">SerenitySound Test</ThemedText>

        <Button title={isPlaying ? 'Pause Sound' : 'Play Sound'} onPress={isPlaying ? pauseSound : playSound} />

        <Text style={{ marginTop: 16, color: 'white' }}>Volume: {Math.round(volume * 100)}%</Text>
        <Slider
          style={{ width: '80%', marginVertical: 16 }}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={(val: number) => setVolume(val)}
        />
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 16,
    paddingVertical: 24,
  },
});
