export const responseError = JSON.stringify({
    status: 'error',
    message: err.message,
    code: err.code,
})

export const responseSuccess = JSON.stringify({
    status: 'success',
    message: err.message,
    code: err.code,
})