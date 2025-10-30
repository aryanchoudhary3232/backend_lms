function notFound(res, entity = "Resource", message) {
  return res.status(404).json({
    success: false,
    error: true,
    message: message || `${entity} not found`,
  });
}

module.exports = { notFound };