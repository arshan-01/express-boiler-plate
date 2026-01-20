function ok(res, data, message = "OK", meta) {
  const payload = { success: true, message, data };
  if (meta !== undefined) payload.meta = meta;
  return res.json(payload);
}

function created(res, data, message = "Created", meta) {
  const payload = { success: true, message, data };
  if (meta !== undefined) payload.meta = meta;
  return res.status(201).json(payload);
}

export { ok, created };


