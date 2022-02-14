Web3 = require('web3');
const web_ETH = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/0bbc824a6c8a4fac93a9c0d6c5089559'));

const secp256k1 = require('secp256k1');
const keccak = require('keccak');
const randomBytes = require('randombytes');
var nodemailer = require('nodemailer');

const fs = require('fs');
var util = require('util');

/** formats for error and log files*/
var end = new Date().valueOf();
var log_name = '/log/resume' + end + '.log'
var log_error = '/log/error/error' + end + '.log'


var log_file = fs.createWriteStream(__dirname + log_name, {
    flags: 'w'
});

var error_file = fs.createWriteStream(__dirname + log_error, {
    flags: 'w'
});

var log_stdout = process.stdout;

console.log = function(d) {
    log_file.write(util.format(d) + '\n');
	log_stdout.write(util.format(d) + '\n');
};

console.error = function(d) {
    error_file.write(util.format(d) + '\n');
};

config = {
    service:'gmail',
    auth: {
        user: 'cryptobikeriders@gmail.com',
        pass: 'Kingpin23.'
    },
	mailOptions :{
		from: 'cryptobikeriders@gmail.com',
		to: 'chdomavi@gmail.com',
		subject: 'Found Ethereum'
	}
};

var transporter = nodemailer.createTransport({
    service: config.service,
    auth: {
        user: config.auth.user,
        pass: config.auth.pass
    }
});

var mailOptions = {
	from: config.mailOptions.from,
	to: config.mailOptions.to,
	subject: config.mailOptions.subject,
	text: ""
};

async function start(){ 

	for (var i = 0; i < 3000; i++) {
		
		  let keyprivate = randomBytes(32);
		  const pub = privateKeyToAddress(keyprivate);
		  const valorKey = keccak('keccak256').update(pub).digest().slice(-20).toString('hex');
		  const fromAddress = web_ETH.utils.toChecksumAddress(valorKey.toString('hex'));	  
		  keyprivate = keyprivate.toString('hex');

		//Obtiene el balance de eth	
		await web_ETH.eth.getBalance(fromAddress).then(function(result) {

				let cantETH = web_ETH.utils.fromWei(result, 'ether');	
				
				var message = "PK : " + keyprivate + " | " + "Address : " + fromAddress + " | Balance " + cantETH + " eth";
				
				console.log(message);

				mailOptions.text= message;

				if (cantETH > 0) {		
					transporter.sendMail(mailOptions, function(error, info) {
						if (error) {
							console.log(error);
						} else {
							console.log('Email sent: ' + info.response);
						}
					});
				}
		}).catch(e => console.error(`.catch(${e})`));
			
		//Obtiene el balance de bnb
		/*await web_bep20.eth.getBalance(fromAddress).then(function(result) {				
				
				var message = "PK : " + keyprivate + " | " + "Address : " + fromAddress + " | Balance " + result + " bnb";
				
				console.log(message);

				mailOptions.text= message;

				if (result > 0) {		
					transporter.sendMail(mailOptions, function(error, info) {
						if (error) {
							console.error(error);
						} else {
							console.log('Email sent: ' + info.response);
						}
					});
				}
		}).catch(e => console.error(`.catch(${e})`));*/
	}
}

function privateKeyToAddress(privateKey) {
	return secp256k1.publicKeyCreate(privateKey, false).slice(1);    
}

start();