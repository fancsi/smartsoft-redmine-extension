function openRedmine() {
	chrome.tabs.create({ 'url': "https://redmine.3ss.tv/my/page" });
	chrome.notifications.clear('notify1');
}

chrome.notifications.onClicked.addListener(function () {
	openRedmine();
});

chrome.notifications.onButtonClicked.addListener(function (notifId, btnIdx) {
	if (notifId === 'notify1') {
		if (btnIdx === 0) {
			scheduleNext(true);
			chrome.notifications.clear('notify1');
		} else {
			openRedmine();
		}
	}
});

chrome.runtime.onMessage.addListener(function (message, sender, senderResponse) {
	if (message.type === "scheduleNext") {
		scheduleNext();
	}
});

chrome.alarms.onAlarm.addListener(function (alarm) {
	if (alarm.name == 'schedule') {
		checkToday();
	}
});


var opt = {
    iconUrl: 'logo.png',
    type: 'basic',
    title: 'Redmine reminder',
    message: 'This is a reminder to add your hours.',
	buttons: [{
		title: "Skip today"
	}],
    priority: 1
};

function scheduleAfterSnooze() {
	getLocalStorage('reminder_snooze_minutes', 30, val => {
		var reminder_snooze_minutes = +val;
		chrome.alarms.clear('schedule');
		chrome.alarms.create('schedule', {
			delayInMinutes: reminder_snooze_minutes
		});
		console.log(new Date() + ': Scheduled check in: ' + reminder_snooze_minutes * 60 * 1000 + ' ms');
	});
}	

var checkToday = function () {
	fetch('https://redmine.3ss.tv/my/page', { credentials: 'include' }).then(res => {
		if (res.ok) {
			res.text().then(html => {
				var date = html.match(/<tbody>\s*<tr\s*class="odd">\s*<td>\s*<strong>([^<]+)<\/strong>/mi);
				var dateString = date != null ? date[1] || "" : "";
				var todayMissing = !isNaN(new Date(dateString).getTime());
				
				var isWeekend = ((new Date()).getDay() == 6) || ((new Date()).getDay() == 0);

				if (todayMissing && !isWeekend) {
					chrome.notifications.clear('notify1');
					chrome.notifications.create('notify1', opt, function (id) {
						scheduleAfterSnooze();
					});
				} else {
					scheduleNext(true);
				}
			});
		} else {
			scheduleAfterSnooze();
		}
	}).catch(e => {
		scheduleAfterSnooze()
	});
}

function getLocalStorage(key, fallback, callback) {
	chrome.storage.local.get(key).then(val => {
		if (val[key] !== undefined) {
			callback(val[key]);
		} else {
			callback(fallback);
		}
	});
}


function scheduleNext(tomorrow) {
	getLocalStorage('enable_reminder', 'true', enable_reminder => {
		getLocalStorage('reminder_time', '17:00', reminder_time => {
			var today = new Date();
			if (enable_reminder == "false") {
				console.log(today + ': Reminder is not enabled, skipping schedule');
				return;
			}
			var checkTime = new Date();
			console.log(reminder_time);

			if (tomorrow) {
				checkTime.setDate(checkTime.getDate() + 1);
			}

			checkTime.setHours(+reminder_time.split(':')[0] || 0);
			checkTime.setMinutes(+reminder_time.split(':')[1] || 0);
			checkTime.setSeconds(+reminder_time.split(':')[2] || 0);

			chrome.alarms.clear('schedule');
			chrome.alarms.create('schedule', {
				when: checkTime.getTime()
			});
			console.log(today + ': Scheduled check in: ' + (checkTime - today) + ' ms');
		});
	});
}

scheduleNext();