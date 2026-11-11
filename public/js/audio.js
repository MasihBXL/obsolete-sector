// Retro Procedural Web Audio Engine for Indie Horror Terminal
// Provides mechanical clicks, CRT buzzes, static noise bursts, floppy drive seek, and ambient drone.

class RetroSoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = localStorage.getItem('sound_enabled') === 'true';
        this.ambientPlaying = false;
        this.ambientGain = null;
        this.droneOsc1 = null;
        this.droneOsc2 = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleSound() {
        this.init();
        this.enabled = !this.enabled;
        localStorage.setItem('sound_enabled', this.enabled);
        if (this.enabled) {
            this.startAmbientDrone();
            this.playSelect();
        } else {
            this.stopAmbientDrone();
        }
        return this.enabled;
    }

    // Subtle relay tick for hovering over links/games
    playHover() {
        if (!this.enabled) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.03);

            gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.03);
        } catch (e) {}
    }

    // Heavy CRT switch / degauss click when selecting a game
    playSelect() {
        if (!this.enabled) return;
        this.init();
        try {
            const t = this.ctx.currentTime;
            
            // Low thump
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(180, t);
            osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);

            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.12);

            // CRT static burst
            this.playStaticBurst(0.06, 0.05);
        } catch (e) {}
    }

    // White noise static burst
    playStaticBurst(duration = 0.08, volume = 0.05) {
        if (!this.enabled) return;
        this.init();
        try {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = this.ctx.createBufferSource();
            whiteNoise.buffer = buffer;

            // Bandpass filter to make it sound like analog static
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1600;
            filter.Q.value = 1.2;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            whiteNoise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            whiteNoise.start();
        } catch (e) {}
    }

    // Mechanical chunky keyboard key
    playTerminalKey() {
        if (!this.enabled) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            const f = 200 + Math.random() * 150;
            osc.frequency.setValueAtTime(f, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.02);

            gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.02);
        } catch (e) {}
    }

    // Floppy disk drive stepping and sector seek on download click
    playDownload() {
        if (!this.enabled) return;
        this.init();
        try {
            let now = this.ctx.currentTime;
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    this.playStaticBurst(0.04, 0.08);
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(320 + i * 40, this.ctx.currentTime);
                    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.03);
                }, i * 65);
            }
        } catch (e) {}
    }

    // Low dark ambient industrial drone
    startAmbientDrone() {
        if (!this.enabled || this.ambientPlaying) return;
        this.init();
        try {
            this.ambientGain = this.ctx.createGain();
            this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
            this.ambientGain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 2.0);

            // Low frequency oscillators
            this.droneOsc1 = this.ctx.createOscillator();
            this.droneOsc1.type = 'sawtooth';
            this.droneOsc1.frequency.setValueAtTime(45, this.ctx.currentTime); // Low F

            this.droneOsc2 = this.ctx.createOscillator();
            this.droneOsc2.type = 'sine';
            this.droneOsc2.frequency.setValueAtTime(67.5, this.ctx.currentTime); // Fifth

            // Low-pass filter to make it rumbling and subterranean
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(140, this.ctx.currentTime);

            this.droneOsc1.connect(filter);
            this.droneOsc2.connect(filter);
            filter.connect(this.ambientGain);
            this.ambientGain.connect(this.ctx.destination);

            this.droneOsc1.start();
            this.droneOsc2.start();
            this.ambientPlaying = true;
        } catch (e) {}
    }

    stopAmbientDrone() {
        if (!this.ambientPlaying) return;
        try {
            if (this.ambientGain) {
                this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
                setTimeout(() => {
                    if (this.droneOsc1) { this.droneOsc1.stop(); this.droneOsc1.disconnect(); }
                    if (this.droneOsc2) { this.droneOsc2.stop(); this.droneOsc2.disconnect(); }
                    this.ambientPlaying = false;
                }, 550);
            }
        } catch (e) {
            this.ambientPlaying = false;
        }
    }

    // Audition sample directly (works even if global sound is muted)
    auditionSample(synthType) {
        this.init();
        const t = this.ctx.currentTime;
        try {
            if (synthType === 'analog_click' || synthType === 'relay_click') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(synthType === 'relay_click' ? 1800 : 900, t);
                osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.08);
            } else if (synthType === 'crt_hum') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(60, t);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.6);
            } else if (synthType === 'ambient_drone') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(55, t);
                osc.frequency.linearRampToValueAtTime(40, t + 0.8);
                gain.gain.setValueAtTime(0.18, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.8);
            } else if (synthType === 'floppy_seek') {
                this.playDownload();
            } else {
                // static noise burst
                this.playStaticBurst(0.15, 0.12);
            }
        } catch (e) {}
    }
}

window.soundEngine = new RetroSoundEngine();
