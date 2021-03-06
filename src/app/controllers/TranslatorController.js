/**
* @name Message Translator Controller
* @author Julhas Sujan
* @version 1.0.0
*/

'use strict';
let request   = require('request');
let dbConnect = require('../config/db-config');
let fn        = require('../function');
let logger4js = require('../../logger/log4js');
let exchanger = require('./ExchangeController');
// APi Connection String		
let db= dbConnect.getConnection();
module.exports = {	
	// This method is for processing source data into queues and automatic mode data exchange		
	processMessages: function(requestType, modeType,exportLimit,exportFromDays){

		//let requestType 	= "createdSince";
		//let dateFrom 		= req.body.dateFrom;
		let displayLimit 	= exportLimit;
		//let date            = dateFrom.split("-");
		let dateSince       = "20180101";
		//let dateSince       = fn.getTodayYYYYMM()+exportFromDays;
		let exchangeMode;
		if(modeType==0){
			exchangeMode   = "persistent";
		} else {
			exchangeMode   = "automatic";
		}
		let operationType   = null; 

		//console.log("Dynamic dateSince: ",dateSince);
		// Database API information		
		function getChannelSettingsInformation(name) {
		    return db.task('getChannelSettingsInformation', t => {
	            return t.oneOrNone('select aps.*,q.* from api_settings aps left join queues q on q.id=aps.queue where channel_type = $1',name)
	                .then(apiInfo => {
	                    return apiInfo;
	                });
		    });
		}

		// Return Traslator Mapping data
		function getTranslatorMapping() {
		    return db.task('getTranslatorMapping', t => {
	            return t.oneOrNone('select tm.*, cha.channel_name from translator_mapping tm inner join api_settings cha on cha.id=tm.channel_id')
	                .then(apiInfo => {
	                    return apiInfo;
	                });
		    });
		}

		function dataValidator(data){

			if (data==null || data=='undefined') {
				return '';
			} else {
				return data;
			}

		}

/**********************************************************************
**********************Generate JSON Payload from source system ********
**********************************************************************/	
		getChannelSettingsInformation("source").then(apiInfo => {

			let apiData      = JSON.parse(JSON.stringify(apiInfo));
			let baseUrl 	 = apiData.base_url;
			let resourcePath = apiData.resource_path;
			let tokenType    = apiData.token_type;
			let token        = apiData.token_string;

			let apiUrl = baseUrl+resourcePath+requestType+"="+dateSince+"&client_id=123551&offset=1&limit="+displayLimit;
			let options = {
				url: apiUrl,
				method: 'GET',
				headers: {
				  'X-Auth-Token': token
				},
				from: {
				  mimeType: 'application/json'
				}
			};
		//console.log("Options:",options);		

		// To get source information			
			request(options, function(error, response, body) {
				//console.log("response:",response);
				let data          = JSON.stringify(JSON.parse(body));
			
				let facilityInfo1 = data.replace('[','');
				let facilityInfo  = facilityInfo1.replace(']','');
				let pdata         = data.replace(/&quot;/g, '"');
				let json          = JSON.parse(pdata);
				let jsonArr       = [];
				let i, status;
		// Status Management 
				if(requestType=="createdSince") {
					status        = 'create';
					operationType = "created";

				} else if(requestType=="updatedSince") {
					status        = 'update';
					operationType = "updated";

				} if(requestType == "deletedSince") {
					status 		  = 'delete';
					operationType = "deleted";
				}		
		// JSON Payload Generate from source, dynamic mapping
			getTranslatorMapping().then(info => {
				let mapInfo   = JSON.parse(JSON.stringify(info));
				for(i = 0; i < json.length; i++) {

					let level3Id, level3name, level4Id, level4Name, level5Id,level5Name;
					let openingDate  = (json[i].created_at).split(" "); 

					/*if(json[i].union_code == null){
						level3Id   = '';
						level3name = '';
					} else {
						level3Id   = json[i][mapInfo.level3_id];
						level3name = json[i][mapInfo.level3_id] +" Union";
					}

					if(json[i].upazila_code == null){
						level4Id   = '';
						level4Name = '';
					} else {
						level4Id   = json[i][mapInfo.level4_id];
						level4Name = json[i][mapInfo.level4_name] + " Upazila";
					}

					if(json[i][mapInfo.level5_id]=='null'){
						level5Id = '';
						level5Name = '';
					}*/

					let shortName = json[i].name.split(" ");
				    let createdAt = json[i].created_at.split(" ");

				    jsonArr.push({
				        code       	:  dataValidator(json[i][mapInfo.code]),
				        name       	:  dataValidator(json[i][mapInfo.org_name]),
				        shortName  	:  dataValidator(shortName[0])+' '+dataValidator(shortName[1])+' '+dataValidator(shortName[2]),
				        displayName	:  dataValidator(json[i][mapInfo.org_name]),
				        displayShortName: dataValidator(json[i][mapInfo.org_name]),
				        openingDate	:  dataValidator(openingDate[0]),
				        level2Id 	:  dataValidator(json[i][mapInfo.level2_id]),
				        level2Name  :  dataValidator(json[i][mapInfo.level2_name]),
				        level3Id 	:  dataValidator(json[i][mapInfo.level3_id]),
				        level3Name  :  dataValidator(json[i][mapInfo.level3_name]),
				        level4Id  	:  dataValidator(json[i][mapInfo.level4_id]),
				        level4Name	:  dataValidator(json[i][mapInfo.level4_name]),
				        level5Id 	:  dataValidator(json[i][mapInfo.level5_id]),
				        level5Name	:  dataValidator(json[i][mapInfo.level5_name]),
				        latitude   	:  dataValidator(json[i][mapInfo.latitude]),
				        longitude  	:  dataValidator(json[i][mapInfo.longitude]),
				        phoneNumber	:  dataValidator(json[i][mapInfo.phone_number]),
				        contactPerson : dataValidator(json[i][mapInfo.contact_person]),
				        address   	:  dataValidator(json[i][mapInfo.address]),
				        email   	:  dataValidator(json[i][mapInfo.email]),
				        created 	:  dataValidator(createdAt[0]),
				        facilitytypeCode:  dataValidator(json[i].facilitytype_code),
				        facilitytypeName:  dataValidator(json[i].facilitytype_name),
				        status     	:  status,
				        parent      : {
				        				code:dataValidator(json[i][mapInfo.level2_id])+''+dataValidator(json[i][mapInfo.level3_id])+''+dataValidator(json[i][mapInfo.level4_id]),
				        				name:dataValidator(json[i][mapInfo.level5_name]),
				        				level:5,
				        				parent: {
				        					code:dataValidator(json[i][mapInfo.level2_id])+''+dataValidator(json[i][mapInfo.level3_id])+''+dataValidator(json[i][mapInfo.level4_id]),
				        					name:dataValidator(json[i][mapInfo.level4_name]),
				        					level:4,
				        					parent: {
				        						code:dataValidator(json[i][mapInfo.level2_id])+''+dataValidator(json[i][mapInfo.level3_id]),
				        						name:dataValidator(json[i][mapInfo.level3_name]),
				        						level:3,
				        						parent: {
				        							code:dataValidator(json[i][mapInfo.level2_id]),
				        							name:dataValidator(json[i][mapInfo.level2_name]),
				        							level:2,
				        						}
				        					}
				        				}
				        			},  
				        parentCode 	:  dataValidator(json[i][mapInfo.level2_id])+''+ dataValidator(json[i][mapInfo.level3_id])+''+dataValidator(json[i][mapInfo.level4_id])+''+dataValidator(json[i][mapInfo.level5_id])
				        
				    });
				//console.log("jsonArr: ",jsonArr);
				logger4js.getLoggerConfig().debug("JSON Payload for DHIS2: ",jsonArr);
				logger4js.getLoggerConfig().error(error);

				let orgCode	   = json[i].code;
				let orgName    = json[i].name;
				let parentCode = dataValidator(json[i][mapInfo.level2_id])+''+ dataValidator(json[i][mapInfo.level3_id])+''+dataValidator(json[i][mapInfo.level4_id])+''+dataValidator(json[i][mapInfo.level5_id]);
				
				//console.log("parentCode:", parentCode);
				//console.log("parentCode: ",parentCode);
				//console.log("jsonData:", jsonData);
				var jsonData     = JSON.stringify(jsonArr);
				var pdataSource  = jsonData.replace(/&quot;/g, '"');
				var sourceMessageParse   = JSON.stringify(JSON.parse(pdataSource));
				let sourceMessageReplace = sourceMessageParse.replace('[','');
				let jsonPayload  = sourceMessageReplace.replace(']','');

/********************************************************************
********************** Durability checking ***************** ********
********************************************************************/	
		// Check the durability if durable the data will be stored in queue table	

				if(apiData.durability=='durable' && modeType==0){
			// Add in queue detail table
				let status = 'pending';
				let responseCode = 202; // pending
					db.query("INSERT into queue_detail (queue_id,durability,exchange_mode,operation_type,message,response_code,status,created_at) VALUES('"+apiData.queue+"','"+apiData.durability+"','"+exchangeMode+"','"+operationType+"','"+jsonPayload+"','"+responseCode+"','"+status+"','"+fn.getDateYearMonthDayMinSeconds()+"')").then(info => {	
						console.log("Message queue added in pending list. Queue ID",apiData.queue);
					}).catch(error => {
				    	logger4js.getLoggerConfig().error("System log was not updated!",error);
				    	console.log(error);
				    });	
			// System log table updates
				let logType="Message Transfer";
					db.query("INSERT into system_log (module_name,table_name,exchange_mode,operation_type,log_type,message,created_date,status_code,queue) VALUES('DHIS2 Data Send','schedular_info','"+exchangeMode+"','"+operationType+"','"+logType+"','"+parentCode+','+orgName+"','"+fn.getDateYearMonthDayMinSeconds()+"','"+response.statusCode+"','"+apiData.queue+"')").then(info => {
					}).catch(error => {
				    	logger4js.getLoggerConfig().error("System log was not updated!",error);
				    	console.log(error);
				    });		   
			// Make sure to empty the jsonArr = [];
				jsonArr = [];	     
			// Transient Durability  
				} else if (apiData.durability=='transient' && modeType==0){
			// Call exchange controller
					exchanger.exchangeMessages("destination",jsonPayload,orgCode,orgName,parentCode,exchangeMode,operationType,apiData.queue,apiData.durability);
				} else {
			// Automatic Mode Message Transfer
					exchanger.automaticMessageSendExchanger("destination",jsonPayload,orgCode,orgName,parentCode,exchangeMode,operationType,apiData.queue,apiData.durability);		

				}
			jsonArr = [];	

			} // End for loop 
			}); // End Translator mapping 
			});	// End Request body
		});// End ChannelSettings or source api 	   		
	}
};	

