const fs = require('fs');
const path = require('path');

module.exports = async function (context, req) {
    context.log('Serving static files.');

    // Default to index.html if no file is specified
    const fileName = req.query.file || 'index.html';

    // Path to the 'public' folder at the project root
    const filePath = path.join(__dirname, '..', 'public', fileName);

    try {
        // Check if the file exists
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');

            // Return the file content with the appropriate content type
            context.res = {
                status: 200,
                headers: {
                    'Content-Type': getContentType(fileName)
                },
                body: content
            };
        } else {
            // Return 404 if the file doesn't exist
            context.res = {
                status: 404,
                body: `File "${fileName}" not found`
            };
        }
    } catch (error) {
        // Handle any errors
        context.log(error);
        context.res = {
            status: 500,
            body: 'An error occurred while serving the file.'
        };
    }
};

// Helper function to determine Content-Type based on file extension
function getContentType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
        case '.html': return 'text/html';
        case '.css': return 'text/css';
        case '.js': return 'application/javascript';
        case '.json': return 'application/json';
        case '.png': return 'image/png';
        case '.jpg': return 'image/jpeg';
        case '.svg': return 'image/svg+xml';
        case '.txt': return 'text/plain';
        default: return 'application/octet-stream';
    }
}
