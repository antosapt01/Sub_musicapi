class ExportsHandler {
  constructor(playlistsService, service, validator) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;

    this.postExportSongsHandler = this.postExportSongsHandler.bind(this);
  }

  async postExportSongsHandler(request, h) {
    this._validator.validateExportSongsPayload(request.payload);

    const message = {
      userId: request.auth.credentials.id,
      targetEmail: request.payload.targetEmail,
    };

    const user_id = request.auth.credentials.id;
    const playlist_id = request.params.playlistId;
    await this._playlistsService.verifyPlaylistOwner(playlist_id, user_id);

    await this._service.sendMessage('export:songs', JSON.stringify(message));
    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
