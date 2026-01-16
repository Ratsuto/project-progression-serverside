export const respond = (res, code = 200, message = '', success = true, result = null) => {
	return res.status(code).json({
		code,
		success,
		message,
		...(result !== null && {result})
	});
};

respond.success = (res, code, message, success, result = null) =>
	respond(res, 200, message, true, result);

respond.error = (res, code, message, success, result = null) =>
	respond(res, code, message, success, result);
