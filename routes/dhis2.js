/**
* New facility JSOn payload sends to DHIS2
* @method {POST} jsonPayload.dashControllerJsonPayload
* @return {JSON} payload for dhis2    
*/
// Database Cooneciton String
let dbConnect = require('../src/app/config/db-config');
let db = dbConnect.getConnection();

let express = require('express');
let router  = express.Router();
let cron    = require('node-cron');
let jsonPayload = require('../src/app/controllers/HrisToDhis2AutoDataSendController');
let dhis2Contorller     = require('../src/app/controllers/DHIS2Controller');

// Send JSON Payload from Dashboard to DHIS2
router.post('/facility-create-json-payload',dhis2Contorller.facilityCreateJSONPayloadSendToDHIS2);

// Schedular seetings information from schedular_info table
function getCronJobSettingsInformation(name) {
	let conName = name;
    return db.task('getApiSettingsInformation', t => {
            return t.oneOrNone('SELECT * FROM schedular_info where short_code=$1',conName)
                .then(info => {
                    return info;
                });
        });
}

getCronJobSettingsInformation("hris").then(info => {
	let data      = JSON.parse(JSON.stringify(info));
	let isEnable  = data.is_enable;
	let startTime = data.start_time;
	let duration  = data.duration;
	console.log("Cron job status: ",isEnable);
	let schedularTask = ["createdSince","updatedSince","deletedSince"];
	// if Schedular settings is on
	if(isEnable==1){
		// Running the cron job in every five minutes 
		cron.schedule('* * * * *', function(){
		  //console.log('running a task every minute');
		  for (let i = 0; i < schedularTask.length; i++) {		  	
		  	jsonPayload.facilityCreateJSONPayloadSendToDHIS2(schedularTask[i]);
		  }
		  
		});
	}


}).catch(error => {
    console.log(error);
});	



module.exports = router;
