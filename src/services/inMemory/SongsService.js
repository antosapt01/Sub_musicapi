const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
 
class SongsService {
  constructor() {
    this._songs = [];
  }
 
    addSong({ title, year, performer, genre, duration }) {
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;
    
        const newNote = {
        title, year, performer, genre, duration, createdAt, updatedAt,
        };

        this._songs.push(newNote);

        const isSuccess = this._songs.filter((song) => song.id === id).length > 0;

        if (!isSuccess) {
            throw new InvariantError('Catatan gagal ditambahkan');
          }
       
        return id;
    }

    getSongs() {
        return this._songs;
    }

    getSongById(id) {
        const songs = this._songs.filter((n) => n.id === id)[0];
        if (!songs) {
          throw new NotFoundError('Catatan tidak ditemukan');
        }
        return songs;
    }

    editSongById(id, { title, year, performer, genre, duration }) {
        const index = this._songs.findIndex((song) => song.id === id);
     
        if (index === -1) {
          throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
        }
     
        const updatedAt = new Date().toISOString();
     
        this._songs[index] = {
          ...this._songs[index],
          title,
          year,
          performer,
          genre,
          duration,
          updatedAt,
        };
    }

    deleteSongById(id) {
        const index = this._songs.findIndex((song) => song.id === id);
        if (index === -1) {
          throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
        }
        this._songs.splice(index, 1);
    }
}
module.exports = SongsService;