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

		chrome.storage.local.set({
			work_hours: localStorage.work_hours,
			reminder_time: localStorage.reminder_time,
			reminder_snooze_minutes: localStorage.reminder_snooze_minutes,
			enable_reminder: localStorage.enable_reminder
		}).then(function () { });
	   
		chrome.runtime.sendMessage({
			type: 'scheduleNext'
		});

		$('#save_success').show();
		setTimeout(() => {
			$('#save_success').hide();
		}, 10000);
	});
});