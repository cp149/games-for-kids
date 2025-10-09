/**
 * Song Library - Collection of children's songs with simple melodies
 */

export class SongLibrary {
    constructor() {
        this.songs = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize the song library
     */
    init() {
        this.loadDefaultSongs();
        this.isInitialized = true;
        console.log('🎵 Song Library initialized with', this.songs.size, 'songs');
    }

    /**
     * Load default children's songs
     */
    loadDefaultSongs() {
        // Twinkle, Twinkle, Little Star
        this.addSong('twinkle', {
            title: 'Twinkle, Twinkle, Little Star',
            tempo: 100,
            timeSignature: '4/4',
            difficulty: 'easy',
            notes: [
                { note: 'C4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'A4', duration: 500 },
                { note: 'A4', duration: 500 },
                { note: 'G4', duration: 1000 },
                
                { note: 'F4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'C4', duration: 1000 },
                
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 1000 },
                
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 1000 }
            ]
        });

        // Happy Birthday
        this.addSong('birthday', {
            title: 'Happy Birthday to You',
            tempo: 120,
            timeSignature: '3/4',
            difficulty: 'easy',
            notes: [
                { note: 'C4', duration: 375 },
                { note: 'C4', duration: 125 },
                { note: 'D4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 1000 },
                
                { note: 'C4', duration: 375 },
                { note: 'C4', duration: 125 },
                { note: 'D4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'F4', duration: 1000 },
                
                { note: 'C4', duration: 375 },
                { note: 'C4', duration: 125 },
                { note: 'C5', duration: 500 },
                { note: 'A4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 1000 },
                
                { note: 'B4', duration: 375 },
                { note: 'B4', duration: 125 },
                { note: 'A4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'F4', duration: 1000 }
            ]
        });

        // Mary Had a Little Lamb
        this.addSong('mary', {
            title: 'Mary Had a Little Lamb',
            tempo: 120,
            timeSignature: '4/4',
            difficulty: 'easy',
            notes: [
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 1000 },
                
                { note: 'D4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'D4', duration: 1000 },
                { note: 'E4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 1000 },
                
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'C4', duration: 1000 }
            ]
        });

        // Row, Row, Row Your Boat
        this.addSong('row', {
            title: 'Row, Row, Row Your Boat',
            tempo: 110,
            timeSignature: '4/4',
            difficulty: 'easy',
            notes: [
                { note: 'C4', duration: 750 },
                { note: 'C4', duration: 250 },
                { note: 'C4', duration: 500 },
                { note: 'D4', duration: 250 },
                { note: 'E4', duration: 750 },
                
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 250 },
                { note: 'E4', duration: 500 },
                { note: 'F4', duration: 250 },
                { note: 'G4', duration: 1500 },
                
                { note: 'C5', duration: 250 },
                { note: 'C5', duration: 250 },
                { note: 'C5', duration: 250 },
                { note: 'G4', duration: 250 },
                { note: 'G4', duration: 250 },
                { note: 'G4', duration: 250 },
                { note: 'E4', duration: 250 },
                { note: 'E4', duration: 250 },
                { note: 'E4', duration: 250 },
                { note: 'C4', duration: 250 },
                { note: 'C4', duration: 250 },
                { note: 'C4', duration: 250 },
                
                { note: 'G4', duration: 500 },
                { note: 'F4', duration: 250 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 250 },
                { note: 'C4', duration: 1500 }
            ]
        });

        // ========== BEGINNER LEVEL ==========
        
        // Baa, Baa, Black Sheep
        this.addSong('baa-baa', {
            title: 'Baa, Baa, Black Sheep',
            tempo: 100,
            timeSignature: '4/4',
            difficulty: 'beginner',
            notes: [
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 1000 },
                
                { note: 'C4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'B3', duration: 500 },
                { note: 'B3', duration: 500 },
                { note: 'A3', duration: 500 },
                { note: 'A3', duration: 500 },
                { note: 'G3', duration: 1000 }
            ]
        });

        // Three Blind Mice
        this.addSong('three-mice', {
            title: 'Three Blind Mice',
            tempo: 120,
            timeSignature: '4/4',
            difficulty: 'beginner',
            notes: [
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'C4', duration: 1000 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'C4', duration: 1000 },
                
                { note: 'G4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'G4', duration: 1000 },
                
                { note: 'G4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'G4', duration: 1000 }
            ]
        });

        // Old MacDonald Had a Farm
        this.addSong('old-macdonald', {
            title: 'Old MacDonald Had a Farm',
            tempo: 120,
            timeSignature: '4/4',
            difficulty: 'beginner',
            notes: [
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 1000 },
                
                { note: 'B3', duration: 500 },
                { note: 'B3', duration: 500 },
                { note: 'A3', duration: 500 },
                { note: 'A3', duration: 500 },
                { note: 'G3', duration: 1000 },
                
                // E-I-E-I-O part
                { note: 'D4', duration: 500 },
                { note: 'G3', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'G3', duration: 500 },
                { note: 'D4', duration: 1000 }
            ]
        });

        // ========== EASY LEVEL ==========

        // London Bridge Is Falling Down
        this.addSong('london-bridge', {
            title: 'London Bridge Is Falling Down',
            tempo: 110,
            timeSignature: '4/4',
            difficulty: 'easy',
            notes: [
                { note: 'G4', duration: 500 },
                { note: 'A4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'G4', duration: 1000 },
                
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 1000 },
                { note: 'E4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'G4', duration: 1000 },
                
                { note: 'G4', duration: 500 },
                { note: 'A4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'G4', duration: 1000 }
            ]
        });

        // Hickory Dickory Dock
        this.addSong('hickory-dock', {
            title: 'Hickory Dickory Dock',
            tempo: 100,
            timeSignature: '4/4',
            difficulty: 'easy',
            notes: [
                { note: 'C4', duration: 250 },
                { note: 'D4', duration: 250 },
                { note: 'E4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'C4', duration: 500 },
                
                { note: 'G4', duration: 1000 },
                { note: 'G4', duration: 500 },
                { note: 'E4', duration: 250 },
                { note: 'F4', duration: 250 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'C4', duration: 1000 }
            ]
        });

        // The Wheels on the Bus
        this.addSong('wheels-bus', {
            title: 'The Wheels on the Bus',
            tempo: 130,
            timeSignature: '4/4',
            difficulty: 'easy',
            notes: [
                // "The wheels on the bus go round and round"
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 1000 },
                
                // "Round and round, round and round"
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 1000 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 1000 },
                
                // "The wheels on the bus go round and round, all through the town"
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'G3', duration: 1000 }
            ]
        });

        // Are You Sleeping (Frère Jacques)
        this.addSong('are-you-sleeping', {
            title: 'Are You Sleeping (Frère Jacques)',
            tempo: 120,
            timeSignature: '4/4',
            difficulty: 'easy',
            notes: [
                { note: 'C4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'C4', duration: 500 },
                
                { note: 'E4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'G4', duration: 1000 },
                { note: 'E4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'G4', duration: 1000 },
                
                // "Morning bells are ringing"
                { note: 'G4', duration: 250 },
                { note: 'A4', duration: 250 },
                { note: 'G4', duration: 250 },
                { note: 'F4', duration: 250 },
                { note: 'E4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'G4', duration: 250 },
                { note: 'A4', duration: 250 },
                { note: 'G4', duration: 250 },
                { note: 'F4', duration: 250 },
                { note: 'E4', duration: 500 },
                { note: 'C4', duration: 500 }
            ]
        });

        // ========== MEDIUM LEVEL ==========

        // Jingle Bells
        this.addSong('jingle-bells', {
            title: 'Jingle Bells',
            tempo: 140,
            timeSignature: '4/4',
            difficulty: 'medium',
            notes: [
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 1000 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 1000 },
                
                { note: 'E4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'C4', duration: 750 },
                { note: 'D4', duration: 250 },
                { note: 'E4', duration: 2000 },
                
                { note: 'F4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'F4', duration: 750 },
                { note: 'F4', duration: 250 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 250 },
                { note: 'D4', duration: 250 },
                { note: 'D4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 1000 },
                { note: 'G4', duration: 1000 }
            ]
        });

        // Silent Night
        this.addSong('silent-night', {
            title: 'Silent Night',
            tempo: 90,
            timeSignature: '3/4',
            difficulty: 'medium',
            notes: [
                { note: 'G4', duration: 1000 },
                { note: 'A4', duration: 500 },
                { note: 'G4', duration: 750 },
                { note: 'E4', duration: 1500 },
                
                { note: 'G4', duration: 1000 },
                { note: 'A4', duration: 500 },
                { note: 'G4', duration: 750 },
                { note: 'E4', duration: 1500 },
                
                { note: 'D5', duration: 1000 },
                { note: 'D5', duration: 750 },
                { note: 'B4', duration: 1500 },
                
                { note: 'C5', duration: 1000 },
                { note: 'C5', duration: 750 },
                { note: 'G4', duration: 1500 }
            ]
        });

        // We Wish You a Merry Christmas
        this.addSong('merry-christmas', {
            title: 'We Wish You a Merry Christmas',
            tempo: 140,
            timeSignature: '3/4',
            difficulty: 'medium',
            notes: [
                { note: 'D4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 250 },
                { note: 'A4', duration: 250 },
                { note: 'G4', duration: 250 },
                { note: 'F#4', duration: 250 },
                { note: 'E4', duration: 500 },
                
                { note: 'E4', duration: 500 },
                { note: 'A4', duration: 500 },
                { note: 'A4', duration: 250 },
                { note: 'B4', duration: 250 },
                { note: 'A4', duration: 250 },
                { note: 'G4', duration: 250 },
                { note: 'F#4', duration: 500 },
                
                { note: 'F#4', duration: 500 },
                { note: 'B4', duration: 500 },
                { note: 'B4', duration: 250 },
                { note: 'C5', duration: 250 },
                { note: 'B4', duration: 250 },
                { note: 'A4', duration: 250 },
                { note: 'G4', duration: 500 },
                
                { note: 'D4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'A4', duration: 500 },
                { note: 'G4', duration: 1000 }
            ]
        });

        // ========== HARD LEVEL ==========

        // Ode to Joy (simplified)
        this.addSong('ode-to-joy', {
            title: 'Ode to Joy (Beethoven)',
            tempo: 120,
            timeSignature: '4/4',
            difficulty: 'hard',
            notes: [
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 500 },
                
                { note: 'C4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 750 },
                { note: 'D4', duration: 250 },
                { note: 'D4', duration: 1000 },
                
                { note: 'E4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'G4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 500 }
            ]
        });

        // Für Elise (opening)
        this.addSong('fur-elise', {
            title: 'Für Elise (Beethoven)',
            tempo: 100,
            timeSignature: '3/8',
            difficulty: 'hard',
            notes: [
                { note: 'E5', duration: 250 },
                { note: 'D#5', duration: 250 },
                { note: 'E5', duration: 250 },
                { note: 'D#5', duration: 250 },
                { note: 'E5', duration: 250 },
                { note: 'B4', duration: 250 },
                { note: 'D5', duration: 250 },
                { note: 'C5', duration: 250 },
                { note: 'A4', duration: 750 },
                
                { note: 'C4', duration: 250 },
                { note: 'E4', duration: 250 },
                { note: 'A4', duration: 250 },
                { note: 'B4', duration: 750 },
                
                { note: 'E4', duration: 250 },
                { note: 'G#4', duration: 250 },
                { note: 'B4', duration: 250 },
                { note: 'C5', duration: 750 }
            ]
        });

        // Canon in D (main theme)
        this.addSong('canon-d', {
            title: 'Canon in D (Pachelbel)',
            tempo: 90,
            timeSignature: '4/4',
            difficulty: 'hard',
            notes: [
                { note: 'F#4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'C#4', duration: 500 },
                { note: 'B3', duration: 500 },
                { note: 'A3', duration: 500 },
                { note: 'B3', duration: 500 },
                { note: 'C#4', duration: 500 },
                
                { note: 'D4', duration: 500 },
                { note: 'C#4', duration: 500 },
                { note: 'B3', duration: 500 },
                { note: 'A3', duration: 500 },
                { note: 'G3', duration: 500 },
                { note: 'F#3', duration: 500 },
                { note: 'G3', duration: 500 },
                { note: 'A3', duration: 500 }
            ]
        });

        // Ave Maria (opening)
        this.addSong('ave-maria', {
            title: 'Ave Maria (Schubert)',
            tempo: 80,
            timeSignature: '4/4',
            difficulty: 'hard',
            notes: [
                { note: 'C4', duration: 1000 },
                { note: 'F4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'F4', duration: 500 },
                { note: 'A4', duration: 500 },
                
                { note: 'G4', duration: 1000 },
                { note: 'F4', duration: 500 },
                { note: 'E4', duration: 500 },
                { note: 'D4', duration: 500 },
                { note: 'C4', duration: 500 },
                { note: 'D4', duration: 1000 }
            ]
        });

        // Audio file songs
        this.addSong('audio-back3', {
            title: 'Background Music 3',
            tempo: 120,
            timeSignature: '4/4',
            difficulty: 'medium',
            audioFile: 'assets/sounds/back3.mp3',
            notes: [] // Will be populated by audio analysis
        });
    }

    /**
     * Add a song to the library
     */
    addSong(id, songData) {
        this.songs.set(id, {
            id,
            ...songData,
            duration: this.calculateSongDuration(songData.notes)
        });
    }

    /**
     * Get a song by ID
     */
    getSong(id) {
        return this.songs.get(id) || null;
    }

    /**
     * Get all songs
     */
    getAllSongs() {
        return Array.from(this.songs.values());
    }

    /**
     * Get songs by difficulty
     */
    getSongsByDifficulty(difficulty) {
        return this.getAllSongs().filter(song => song.difficulty === difficulty);
    }

    /**
     * Calculate total song duration
     */
    calculateSongDuration(notes) {
        return notes.reduce((total, note) => total + (note.duration || 500), 0);
    }

    /**
     * Get song metadata
     */
    getSongInfo(id) {
        const song = this.getSong(id);
        if (!song) return null;

        return {
            id: song.id,
            title: song.title,
            difficulty: song.difficulty,
            duration: song.duration,
            tempo: song.tempo,
            timeSignature: song.timeSignature,
            noteCount: song.notes.length
        };
    }

    /**
     * Get unique notes used in a song
     */
    getSongNotes(id) {
        const song = this.getSong(id);
        if (!song) return [];

        const uniqueNotes = new Set();
        song.notes.forEach(noteData => {
            uniqueNotes.add(noteData.note);
        });
        
        return Array.from(uniqueNotes);
    }

    /**
     * Create a simplified version of a song
     */
    simplifySong(id, maxNotes = 8) {
        const song = this.getSong(id);
        if (!song) return null;

        // Take only the first few notes and extend their duration
        const simplifiedNotes = song.notes.slice(0, maxNotes).map(noteData => ({
            ...noteData,
            duration: Math.max(noteData.duration, 750) // Minimum duration for easy play
        }));

        return {
            ...song,
            id: `${id}_simple`,
            title: `${song.title} (Simple)`,
            difficulty: 'beginner',
            notes: simplifiedNotes,
            duration: this.calculateSongDuration(simplifiedNotes)
        };
    }

    /**
     * Create a chord progression for a song
     */
    getSongChords(id) {
        const song = this.getSong(id);
        if (!song) return [];

        // Simple chord mapping based on key (assuming C major)
        const chordMap = {
            'C4': ['C4', 'E4', 'G4'],
            'D4': ['D4', 'F4', 'A4'],
            'E4': ['E4', 'G4', 'B4'],
            'F4': ['F4', 'A4', 'C5'],
            'G4': ['G4', 'B4', 'D5'],
            'A4': ['A4', 'C5', 'E5'],
            'B4': ['B4', 'D5', 'F5']
        };

        return song.notes.map(noteData => {
            const baseNote = noteData.note;
            const chord = chordMap[baseNote] || [baseNote];
            
            return {
                chord,
                duration: noteData.duration,
                timestamp: noteData.timestamp || 0
            };
        });
    }

    /**
     * Get practice exercises for a song
     */
    getPracticeExercises(id) {
        const song = this.getSong(id);
        if (!song) return [];

        const exercises = [];

        // Exercise 1: Right hand melody only
        exercises.push({
            name: 'Melody Practice',
            description: 'Practice the main melody',
            notes: song.notes,
            tempo: Math.max(60, song.tempo - 30) // Slower tempo
        });

        // Exercise 2: Note sequence (no timing)
        exercises.push({
            name: 'Note Sequence',
            description: 'Learn the note order',
            notes: song.notes.map(noteData => ({ ...noteData, duration: 1000 })),
            tempo: 60
        });

        // Exercise 3: Rhythm practice (single note)
        exercises.push({
            name: 'Rhythm Practice',
            description: 'Practice the rhythm pattern',
            notes: song.notes.map(noteData => ({ note: 'C4', duration: noteData.duration })),
            tempo: song.tempo
        });

        return exercises;
    }

    /**
     * Search songs by title or content
     */
    searchSongs(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.getAllSongs().filter(song =>
            song.title.toLowerCase().includes(lowercaseQuery) ||
            song.difficulty.toLowerCase().includes(lowercaseQuery)
        );
    }

    /**
     * Get random song
     */
    getRandomSong(difficulty = null) {
        let availableSongs = this.getAllSongs();
        
        if (difficulty) {
            availableSongs = this.getSongsByDifficulty(difficulty);
        }
        
        if (availableSongs.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        return availableSongs[randomIndex];
    }

    /**
     * Export song data (for sharing or saving)
     */
    exportSong(id) {
        const song = this.getSong(id);
        if (!song) return null;

        return JSON.stringify(song, null, 2);
    }

    /**
     * Import song data
     */
    importSong(songData) {
        try {
            const song = typeof songData === 'string' ? JSON.parse(songData) : songData;
            
            if (!song.id || !song.title || !song.notes) {
                throw new Error('Invalid song format');
            }
            
            this.addSong(song.id, song);
            return true;
            
        } catch (error) {
            console.error('Failed to import song:', error);
            return false;
        }
    }

    /**
     * Get library statistics
     */
    getStats() {
        const songs = this.getAllSongs();
        const difficulties = {};
        let totalDuration = 0;
        let totalNotes = 0;

        songs.forEach(song => {
            difficulties[song.difficulty] = (difficulties[song.difficulty] || 0) + 1;
            totalDuration += song.duration;
            totalNotes += song.notes.length;
        });

        return {
            totalSongs: songs.length,
            totalDuration,
            totalNotes,
            averageDuration: totalDuration / songs.length,
            averageNotes: totalNotes / songs.length,
            difficulties
        };
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.songs.clear();
        this.isInitialized = false;
        console.log('🎵 Song Library destroyed');
    }
}