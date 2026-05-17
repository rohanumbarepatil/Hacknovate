let buzzerAudioContext = null;
let buzzerOscillators = [];

/**
 * Plays a high-end, tactical smart-city emergency dual-tone siren alarm
 * for 2.5 seconds. Tries static file first and falls back to precise
 * Web Audio API synthesizer if static asset is blocked or missing.
 */
export function playTacticalBuzzer() {
  // Prevent overlapping alarms
  stopTacticalBuzzer();

  try {
    const audio = new Audio('/sounds/emergency-alert.mp3');
    audio.volume = 0.7;
    let played = false;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          played = true;
          // Stop after 2.5 seconds
          setTimeout(() => {
            if (played) {
              audio.pause();
              audio.currentTime = 0;
            }
          }, 2500);
        })
        .catch((err) => {
          console.warn(
            'Static emergency-alert.mp3 failed to play, falling back to tactical synthesizer:',
            err.message
          );
          synthesizeBuzzer();
        });
    } else {
      synthesizeBuzzer();
    }
  } catch (e) {
    synthesizeBuzzer();
  }
}

/**
 * Generates an alternating military-grade tactical dual-tone buzzer warning
 * using raw Web Audio oscillators (Sawtooth/Triangle @ 880Hz/440Hz sweep).
 */
function synthesizeBuzzer() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    buzzerAudioContext = new AudioContext();

    const osc1 = buzzerAudioContext.createOscillator();
    const osc2 = buzzerAudioContext.createOscillator();
    const gainNode = buzzerAudioContext.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // Base dual pitch (A5 + A4 harmony)
    osc1.frequency.setValueAtTime(880, buzzerAudioContext.currentTime);
    osc2.frequency.setValueAtTime(440, buzzerAudioContext.currentTime);

    // Dynamic dual-tone sweep pattern (alternates every 150ms)
    const sweepInterval = setInterval(() => {
      if (buzzerAudioContext && buzzerAudioContext.state === 'running') {
        const time = buzzerAudioContext.currentTime;
        const toggle = Math.floor(time * 6.6) % 2; // ~6.6Hz wail
        osc1.frequency.setValueAtTime(toggle ? 980 : 880, time);
        osc2.frequency.setValueAtTime(toggle ? 490 : 440, time);
      }
    }, 150);

    gainNode.gain.setValueAtTime(0.12, buzzerAudioContext.currentTime);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(buzzerAudioContext.destination);

    osc1.start();
    osc2.start();

    buzzerOscillators = [osc1, osc2, sweepInterval];

    // Safe auto shutdown
    setTimeout(() => {
      stopTacticalBuzzer();
    }, 2500);
  } catch (err) {
    console.error('Tactical buzzer synthesizer initialization failed:', err);
  }
}

/**
 * Immediately stops any active sirens and releases sound resources.
 */
export function stopTacticalBuzzer() {
  if (buzzerOscillators.length > 0) {
    const [osc1, osc2, sweepInterval] = buzzerOscillators;
    clearInterval(sweepInterval);
    try {
      osc1.stop();
    } catch (e) {}
    try {
      osc2.stop();
    } catch (e) {}
    buzzerOscillators = [];
  }
  if (buzzerAudioContext) {
    try {
      buzzerAudioContext.close();
    } catch (e) {}
    buzzerAudioContext = null;
  }
}
