const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapDBToModel } = require('../../utils');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistSongService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylistSong(playlist_Id, songId) {
    const id = `PlaylistSong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlist_Id, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
    return result.rows[0].id;
  }

  async getPlaylistSongs(owner) {
    const query = {
      text: 'select songs.id, songs.title, songs.performer from playlistsongs full join songs on playlistsongs.song_id = songs.id full join playlists on playlistsongs.playlist_id = playlists.id full join collaborations on collaborations.playlist_id=playlists.id where collaborations.user_id =  $1 or playlists.owner = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('lagu tidak ditemukan di dalam playlists');
    }
    return result.rows.map(mapDBToModel);
  }

  async deletePlaylistSongsById(playlist_Id) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 RETURNING id',
      values: [playlist_Id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('id tidak valid');
    }
  }

  async verifyPlaylistSongsOwner(playlist_id, user_id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlist_id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== user_id) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistsSongsAccess(playlist_id, user_id) {
    try {
      await this.verifyPlaylistSongsOwner(playlist_id, user_id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlist_id, user_id);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistSongService;
