const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(5).max(100).required(),
  fullname: Joi.string().required(),
});

module.exports = { UserPayloadSchema };
