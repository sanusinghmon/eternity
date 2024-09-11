const csrf = require('csurf');

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

module.exports = csrfProtection;
