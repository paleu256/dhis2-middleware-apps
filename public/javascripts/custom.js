$(document).ready( function() {
	
// Return current date time	
	function getTodayYYYYMMDD(){
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();
		if(dd<10) {
		    dd = '0'+dd
		} 
		if(mm<10) {
		    mm = '0'+mm
		} 
		return yyyy+''+mm+''+dd;
	}
// Get Random Number
	function getRandomArbitrary(min, max) {
	  	return Math.random() * (max - min) + min;
	}	
	
// Searching Facility	
   $('.facility-search-btn').click(function(e){
        e.preventDefault();

    // Requested data for posting    
        var requestType  = $('#requestType').val();
        var dateFrom     = $('#dateFrom').val();
        var displayLimit = $('#displayLimit').val();		
		var find_info = '&requestType=' + requestType+'&dateFrom='+dateFrom+'&displayLimit='+displayLimit;  
		//console.log(find_info);

		if(requestType==''){
			swal("Sorry!", "Please select searching type.","error");
		} else if(dateFrom==''){
			swal("Sorry!", "Please select your searching date.","error");
		} else{

			 $('#loaderClass').after('<div class="loader"><img src="images/load.gif" alt="Searching......" /></div>');
	// Ajax posting 
			$.ajax({
				type: 'POST',
				data: find_info,
		        //contentType: 'application/json',
	            url: '/dashboard-search',						
	            success: function(data) {
	                console.log('success');
	                //console.log(data);
	                //console.log(JSON.stringify(data));
	                $("#displayFacilityInformation").html(data);
	// Close loader        
	                $('#loader').slideUp(200,function(){        
	               		$('#loader').remove();
		            });
		            $(".loader").fadeOut("slow"); 
	            },
	            error: function(err){
	            	console.log(err);
	            }
	        });
		}

    });	

// Generate Payload	
   $('.json-payload-generates-btn').click(function(e){
        e.preventDefault();

    // Requested data for posting    
        var requestType  = $('#requestType').val();
        var dateFrom     = $('#dateFrom').val();
        var displayLimit = $('#displayLimit').val();		
		var find_info = '&requestType=' + requestType+'&dateFrom='+dateFrom+'&displayLimit='+displayLimit;  
		//console.log(find_info);

		if(requestType==''){
			swal("Sorry!", "Please select searching type.","error");
		} else if(dateFrom==''){
			swal("Sorry!", "Please select your searching date.","error");
		} else{

			 $('#loaderClass').after('<div class="loader"><img src="images/load.gif" alt="Searching......" /></div>');
	// Ajax posting 
			$.ajax({
				type: 'POST',
				data: find_info,
		        //contentType: 'application/json',
	            url: '/dashboard-json-payload',						
	            success: function(data) {

	                //console.log(data);
	                //console.log(JSON.stringify(data));
	                $("#displayFacilityInformation").html(data);
	                var textFieldValue = document.getElementById('displayFacilityInformationText');
					textFieldValue.value=data;
	// Close loader        
	                $('#loader').slideUp(200,function(){        
	               		$('#loader').remove();
		            });
		            $(".loader").fadeOut("slow"); 
	            },
	            error: function(err){
	            	console.log(err);
	            }
	        });
		}

    });	
// JSON sends to DHIS2

   $('.sends-json-dhis-btn').click(function(e){
        e.preventDefault();

    // JSON payload ready    
        var data =$("#displayFacilityInformationText").val();
        var pdata = data.replace(/&quot;/g, '"');
        var displayLimit = $('#displayLimit').val();
        var jsonPayload; 
        if(displayLimit==1){
        	jsonPayload   = pdata.slice(4, -5);
        } else {
        	jsonPayload   = pdata.slice(3, -4);
        }
		
        //console.log(jsonPayload);
    // Loader    
        $('#loaderClass').after('<div class="loader"><img src="images/load.gif" alt="Searching......" /></div>');

	// Ajax Posting
				$.ajax({
				type: 'POST',
				data: jsonPayload,
		        contentType: 'application/json',
	            url: '/facility-create-json-payload',						
	            //url: '/shcedular-json-payload-send-dhis2',						
	            success: function(result) {
	            	
	            	console.log("JSON Payload Response: ",result);
	            	if(result == 200 || result==201){
	            		swal('Congratulations!','Your JSON Payload has submitted successfully.','success');
	            	} else if(result == 409 ){
	            		swal('Sorry!','Conflicting in posting json payload','error');
	            	} else if(result == 500 ){
	            		swal('Sorry!','Internal Server Error!','error');
	            	} 

	// Result print in HTML view            	
	                $("#displayFacilityInformation").html(result);
	                var textFieldValue = document.getElementById('displayFacilityInformationText');
					textFieldValue.value=result;
	// Close loader        
	                $('#loader').slideUp(200,function(){        
	               		$('#loader').remove();
		            });
		            $(".loader").fadeOut("slow"); 
	            },
	            error: function(err){
	            	console.log(err);
	            }
	        }); 
	    });

// Create new api settings
$('.api-settings-btn').click(function(e){
        e.preventDefault();
            // Requested data from API settings form posting    
        var connectionName = $('#connectionName').val();
        var sourceName     = $('#sourceName').val();
        var baseUrl 	   = $('#baseUrl').val();		
        var resourcePath   = $('#resourcePath').val();		
        var tokenType      = $('#tokenType').val();		
        var tokenString    = $('#tokenString').val();		
        var username       = $('#username').val();		
        var password       = $('#password').val();		
        var notes          = $('#notes').val();	

        var paramInfo = '&connectionName=' + connectionName+'&sourceName='+sourceName+'&baseUrl='+baseUrl+'&resourcePath=' + resourcePath+'&tokenType='+tokenType+'&tokenString='+tokenString+'&username=' + username+'&password='+password+'&notes='+notes;  
		console.log(paramInfo);

		if(connectionName==''){
			swal("Sorry!", "Please select connection name.","error");
		}/* else if(baseUrl==''){
			swal("Sorry!", "Please enter api base url.","error");
		} */else{

	// Loader		
			 $('.api-settings-btn').after('<div class="loader"><img src="images/load.gif" alt="Searching......" /></div>');
	// Ajax posting 
			$.ajax({
				type: 'POST',
				cache: false,
				data: paramInfo,
		        //contentType: 'application/json',
	            url: '/api-settings-crud',						
	            success: function(data) {
	            	if(data=='success'){
	            		swal("Success!", "Your API settings has completed","success");
	            	} else {
	            		swal("Sorry!", "Your API settings has not been completed.","error");
	            	}
	// Close loader        
	                $('#loader').slideUp(200,function(){        
	               		$('#loader').remove();
		            });
		            $(".loader").fadeOut("slow"); 
	            },
	            error: function(err){
	            	console.log(err);
	// Close loader        
	                $('#loader').slideUp(200,function(){        
	               		$('#loader').remove();
		            });
		            $(".loader").fadeOut("slow");
	            }
	        });
		}
	

    });			

// Create new Schedular Information
$('.schedular-settings-btn').click(function(e){
        e.preventDefault();
            // Requested data from API settings form posting  
        var is_enable;      
        var name           = $('#name').val();
        var short_code 	   = $('#short_code').val();
        if($('#is_enable:checked').val()=='1'){
        	is_enable = 1;
        } else {
        	is_enable = 0;
        }			
        var schedular_type = $('#schedular_type').val();

        var minutes     = $('#minutes').val();		
        var hours       = $('#hours').val();		
        var dayOfMonth  = $('#dayOfMonth').val();		
        var monthOfYear = $('#monthOfYear').val();		
        var dayOfWeek   = $('#dayOfWeek').val();		
        var notes       = $('#notes').val();	

        var paramInfo = '&name=' + name +'&short_code='+short_code+'&is_enable='+is_enable+'&schedular_type=' + schedular_type+'&minutes='+minutes+'&hours='+hours+'&dayOfMonth='+dayOfMonth+'&monthOfYear='+monthOfYear+'&dayOfWeek='+dayOfWeek+'&notes='+notes;  
		console.log(paramInfo);

		if(name==''){
			swal("Sorry!", "Please select Schedular name.","error");
		}/* else if(short_code==''){
			swal("Sorry!", "Please enter short code.","error");
		} */else{

	// Loader		
			 $('.schedular-settings-btn').after('<div class="loader"><img src="images/load.gif" alt="Searching......" /></div>');
	// Ajax posting 
			$.ajax({
				type: 'POST',
				cache: false,
				data: paramInfo,
		        //contentType: 'application/json',
	            url: '/schedular-settings-crud',						
	            success: function(data) {
	            	if(data=='success'){
	            		swal("Success!", "Your Schedular settings has completed","success");
	            	} else {
	            		swal("Sorry!", "Your Schedular settings has not been completed.","error");
	            	}
	// Close loader        
	                $('#loader').slideUp(200,function(){        
	               		$('#loader').remove();
		            });
		            $(".loader").fadeOut("slow"); 
	            },
	            error: function(err){
	            	console.log(err);
	// Close loader        
	                $('#loader').slideUp(200,function(){        
	               		$('#loader').remove();
		            });
		            $(".loader").fadeOut("slow");
	            }
	        });
		}
	

    });	

// Enable or disable cron job 
$('#is_enable').on('change',function(e){

		var is_enable;
		if($('#is_enable:checked').val()=='1'){
			is_enable = 1; 

		} else if($('#is_enable:checked').val()=='on') {
			is_enable = 1;
		} else {
			is_enable = 0;
		}
        var paramInfo = '&is_enable='+is_enable;

	// Loader		
			$('#is_enable').after('<div class="loader"><img src="images/load.gif" alt="Searching......" /></div>');
	// Ajax posting 
			$.ajax({
				type: 'POST',
				cache: false,
				data: paramInfo,
		        //contentType: 'application/json',
	            url: '/schedular-enable-disable',						
	            success: function(data) {
	            	if(data=='success'){
	            		swal("Success!", "Now your schedular has enabled.","success");
	            		$('#is_enable').val(' ');	
	            	} else {
	            		swal("Sorry!", "Your Schedular settings has not been completed.","error");
	            		$('#is_enable').val(' ');	
	            	}
	// Close loader and set timeout callback function 
					setTimeout(function(){	       
		                $('#loader').slideUp(200,function(){        
		               		$('#loader').remove();	   
			            });
			            $(".loader").fadeOut("slow"); 
			             window.location.reload();
		            }, 1000);            		

	            },
	            error: function(err){
	            	console.log(err);
	// Close loader and set timeout callback function         
	                setTimeout(function(){	       
		                $('#loader').slideUp(200,function(){        
		               		$('#loader').remove();	   
			            });
			            $(".loader").fadeOut("slow"); 
			             window.location.reload();
		            }, 3000);
	            }
	        });

    });	
/****************************************************************
***************************Reports Area**************************
*****************************************************************/

	
// Searching Facility	
   $('.log-history-search').click(function(e){
        e.preventDefault();

    // Requested data for posting    
        var logType  = $('#logType').val();
        var dateFrom     = $('#dateFrom').val();
        var displayLimit = $('#displayLimit').val();		
		var find_info = '&logType=' + logType+'&dateFrom='+dateFrom+'&displayLimit='+displayLimit;  
		console.log(find_info);

		if(logType==''){
			swal("Sorry!", "Please select searching type.","error");
		} /*else if(dateFrom==''){
			swal("Sorry!", "Please select your searching date.","error");
		}*/ else{

			 $('.log-history-search').after('<div class="loader"><img src="images/load.gif" alt="Searching......" /></div>');
	// Ajax posting 
			$.ajax({
				type: 'POST',
				data: find_info,
		        //contentType: 'application/json',
	            url: '/log-history-search',						
	            success: function(data) {
	                console.log('success');
	                if(window != undefined){
	                	console.log("Sorry in error log!");
	                }
	                //console.log(data);
	                //console.log(JSON.stringify(data));
	                $("#displayLogInformation").html(data);
	// Close loader        
	                $('#loader').slideUp(200,function(){        
	               		$('#loader').remove();
		            });
		            $(".loader").fadeOut("slow"); 
	            },
	            error: function(err){
	            	console.log(err);
	            }
	        });
		}

    });	


});				
    			
