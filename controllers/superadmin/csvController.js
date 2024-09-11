const Paper = require('../../models/Paper');
const fastcsv = require('fast-csv');
const fs = require('fs');

// Handle CSV upload and processing
exports.uploadCSV = async (req, res, next) => {
    const { id } = req.params;
    try {
        if (!req.file || req.file.mimetype !== 'text/csv') {
            return res.status(400).send('Invalid file type');
        }

        const paper = await Paper.findById(id);
        if (!paper) {
            return res.status(404).send('Paper not found');
        }

        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(fastcsv.parse({ headers: true }))
            .on('data', row => results.push(row))
            .on('end', async () => {
                fs.unlinkSync(req.file.path); // Remove temp file
                // Process CSV data here
                for (const row of results) {
                    // Handle CSV data
                    // Example: console.log(row);
                }
                res.redirect('/superadmin/papers');
            });
    } catch (err) {
        next(err);
    }
};
