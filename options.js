$(document).ready(function(){
   $('#work_hours')[0].value = localStorage.work_hours || 8; 
   $('#reminder_time')[0].value = localStorage.reminder_time || '17:00';
   $('#reminder_snooze_minutes')[0].value = localStorage.reminder_snooze_minutes || '30';
   $('#enable_reminder')[0].checked = localStorage.enable_reminder == "false" ? false : true;
   

   $('#btn_save').click(function(){
		localStorage.work_hours = $('#work_hours')[0].value;
		localStorage.reminder_time = $('#reminder_time')[0].value;
		localStorage.reminder_snooze_minutes = $('#reminder_snooze_minutes')[0].value;
		localStorage.enable_reminder = $('#enable_reminder')[0].checked;
	   
	    chrome.runtime.sendMessage({
			type: 'scheduleNext'
		});
   });
});