const Contact = require('../models/contact');
const { HttpError } = require('../helpers');

const { ctrlWrapper } = require('../decorators');

const getAllContacts = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 10, favorite = 'true' } = req.query;
  const skip = (page - 1) * limit;
  const result = await Contact.find(
    { owner, favorite },
    '-createdAt -updatedAt',
    { skip, limit }
  ).populate('owner, email subscription');
  res.json(result);
};

const getContatctById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findById({ _id: contactId });
  if (!result) {
    throw HttpError(404, 'not found');
  }
  res.json(result);
};

const addContact = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Contact.create({ ...req.body, owner });
  res.status(201).json(result);
};

const deleteContatctById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findByIdAndRemove(contactId);
  if (!result) {
    throw HttpError(404, 'Not found!');
  }

  res.json({
    message: 'contact deleted',
  });
};

const updateContatctById = async (req, res) => {
  const { contactId } = req.params;

  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });
  if (!result) {
    throw HttpError(404, 'Not found!');
  } else res.json(result);

  res.json(result);
};

const updateStatusContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllContacts: ctrlWrapper(getAllContacts),
  getContatctById: ctrlWrapper(getContatctById),
  addContatct: ctrlWrapper(addContact),
  deleteContatctById: ctrlWrapper(deleteContatctById),
  updateContatctById: ctrlWrapper(updateContatctById),
  updateStatusContact: ctrlWrapper(updateStatusContact),
};
