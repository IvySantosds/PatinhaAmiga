import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

// Escuta o acelerômetro enquanto a tela está ativa e chama onShake ao detectar uma sacudida.
export default function useShake(onShake, enabled = true) {
  const callback = useRef(onShake);

  useEffect(() => {
    callback.current = onShake;
  }, [onShake]);

  useEffect(() => {
    if (!enabled) return undefined;

    let active = true;
    let subscription;
    let lastShakeAt = 0;

    async function subscribe() {
      try {
        const available = await Accelerometer.isAvailableAsync();
        if (!available || !active) return;

        Accelerometer.setUpdateInterval(150);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const force = Math.sqrt(x * x + y * y + z * z);
          const now = Date.now();

          if (force > 1.8 && now - lastShakeAt > 1500) {
            lastShakeAt = now;
            callback.current?.();
          }
        });
      } catch (error) {
        console.warn('O acelerômetro não está disponível.', error);
      }
    }

    subscribe();
    return () => {
      active = false;
      subscription?.remove();
    };
  }, [enabled]);
}
