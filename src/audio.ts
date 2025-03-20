export class AudioManager {
    private backgroundMusic: HTMLAudioElement | null = null;
    private isMuted: boolean = false;

    constructor() {
        // Create audio element
        this.backgroundMusic = new Audio();
        this.backgroundMusic.loop = true;
    }

    playBackgroundMusic(url: string, volume: number = 0.5) {
        if (this.backgroundMusic) {
            this.backgroundMusic.src = url;
            this.backgroundMusic.volume = volume;
            this.backgroundMusic.play().catch(error => {
                console.error('Error playing background music:', error);
            });
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    setVolume(volume: number) {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = volume;
        }
    }

    toggleMute() {
        if (this.backgroundMusic) {
            this.isMuted = !this.isMuted;
            this.backgroundMusic.volume = this.isMuted ? 0 : 0.5;
        }
    }

    pause() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }

    resume() {
        if (this.backgroundMusic) {
            this.backgroundMusic.play().catch(error => {
                console.error('Error resuming background music:', error);
            });
        }
    }
} 