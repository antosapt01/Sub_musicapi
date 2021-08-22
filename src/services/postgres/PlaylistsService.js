const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name , users.username FROM users LEFT JOIN playlists on users.id = playlists.owner LEFT JOIN collaborations on playlists.id = collaborations.playlist_id where collaborations.user_id = $1 or playlists.owner=$1',
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlists gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(playlist_id, user_id) {
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

  // collaborationaccess function
  async verifyPlaylistsAccess(playlist_id, user_id) {
    try {
      await this.verifyPlaylistOwner(playlist_id, user_id);
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

module.exports = PlaylistsService;
