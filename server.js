'use strict';

require('dotenv').config()
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var multer = require('multer');

var app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/filemetadata', {
  useMongoClient: true
});

var port = process.env.PORT || 3003;

app.use(cors({ optionSuccessStatus: 200 }));

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);
app.use(bodyParser.json());

//app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.static('public'));

const UPLOAD_PATH = 'uploads';
var upload = multer({ dest: `${UPLOAD_PATH}/` }); // multer configuration

app.get('/', function (req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

var metadataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: String,
  size: Number
},{ usePushEach: true })

var Metadata = mongoose.model('Metadata', metadataSchema)

var isValidId = function (id) {
  return mongoose.Types.ObjectId.isValid(id)
}

app.get('/hello', function (req, res) {
  res.json({greetings: "Hello, API"});
});

app.post('/api/fileanalyse', upload.single('upfile'), async (req, res, next) => {
	if (!req.file) {
		res.json({
      msg: 'No file uploaded'
    })
	} else {
		var file = req.file;		
		var data = {
			name: file.originalname,
			type: file.mimetype,
			size: file.size
		};
		var newMetadata = new Metadata(data)
	  newMetadata.save()
	    .then(item => {
				res.json({
					name: item.name,
					type: item.type,
					size: item.size
				});
	    })
	    .catch(err => {
	      res.status(400).send("file metadata could not be added");
	    });
	}
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});
