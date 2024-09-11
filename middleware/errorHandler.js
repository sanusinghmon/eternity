const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (process.env.NODE_ENV === 'development') {
        res.status(500).json({ error: err.message });
    } else {
        res.status(500).send('Something went wrong!');
    }
};

module.exports = errorHandler;
