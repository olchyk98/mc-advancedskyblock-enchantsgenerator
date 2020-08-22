const express = require('express');

const app = express();

// VULN: Users can get access to the webserver code. [Dismissed]
// FIXME: Use __dirname -> Webserver dies if nodemon is not executed in the /_webserver folder
app.use('/', express.static('../'));

// FIXME: Bad variable name
const PORT = 4000;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
