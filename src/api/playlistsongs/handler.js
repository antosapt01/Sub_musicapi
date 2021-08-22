class PlaylistSongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistSongsHandler = this.postPlaylistSongsHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);
  }

  async postPlaylistSongsHandler(request, h) {
    this._validator.validatePlaylistsongPayload(request.payload);

    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlist_Id = request.params.playlistId;

    await this._service.verifyPlaylistsSongsAccess(playlist_Id, credentialId);
    await this._service.addPlaylistSong(playlist_Id, songId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlist_Id = request.params.playlistId;

    await this._service.verifyPlaylistsSongsAccess(playlist_Id, credentialId);
    const songs = await this._service.getPlaylistSongs(credentialId);
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async deletePlaylistSongByIdHandler(request) {
    const playlist_Id = request.params.playlistId;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistsSongsAccess(playlist_Id, credentialId);
    await this._service.deletePlaylistSongsById(playlist_Id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistSongsHandler;
