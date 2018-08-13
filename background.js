window.addEventListener('load', function() {
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
	
	var openRedmine = function() {
	    chrome.tabs.create({'url': "http://redmine.3ss.tv/my/page"});
        chrome.notifications.clear('notify1');
	}

	// before windows 10 notification
    chrome.notifications.onClicked.addListener(function() {
		openRedmine();
    });
	
	chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
		if (notifId === 'notify1') {
			if (btnIdx === 0) {
				scheduleNext(true);
				chrome.notifications.clear('notify1');
			} else {
				openRedmine();
			}
		}
	});

    chrome.runtime.onMessage.addListener(function(request, sender, callback) {
        if (request.type == 'getLocalStorage') {
            callback({
                work_hours: localStorage.work_hours
            });
        } else if (request.type == 'scheduleNext') {
			scheduleNext();
		}
    });

    var checkToday = function() {
        $.ajax({
            url: 'http://redmine.3ss.tv/my/page',
        }).done(function(data) {
            var doc = $.parseHTML(data);
            var todayMissing = $('.time-entries .odd td strong:contains("Today")', doc).length == 0;
            var isWeekend = ((new Date()).getDay() == 6) || ((new Date()).getDay() == 0);
            
            if (todayMissing && !isWeekend) {
				chrome.notifications.clear('notify1');
                chrome.notifications.create('notify1', opt, function(id) {
                    clearTimeout(timeout);
                    timeout = setTimeout(function() {
                        checkToday();
                    }, (+localStorage.reminder_snooze_minutes || 30) * 60 * 1000);
                    console.log(new Date() + ': Scheduled check in: ' + ((+localStorage.reminder_snooze_minutes || 30) * 60 * 1000) + ' ms' );
                });
            } else {
                scheduleNext(true);
            }
        });
    }
	
    var timeout;
	
	var scheduleNext = function(tomorrow) {
		var today = new Date();
		if (localStorage.enable_reminder == "false") {
			console.log(today + ': Reminder is not enabled, skipping schedule');
			return;
		}
		var checkTime = new Date();
		var reminder_time = localStorage.reminder_time || '17:00';
		
		if (tomorrow) {
			checkTime.setDate(checkTime.getDate() + 1);
		}
		
		checkTime.setHours(+reminder_time.split(':')[0] || 0);
		checkTime.setMinutes(+reminder_time.split(':')[1] || 0);
		checkTime.setSeconds(+reminder_time.split(':')[2] || 0);

		clearTimeout(timeout);
		timeout = setTimeout(function() {
			checkToday();
		}, checkTime - today);
		console.log(today + ': Scheduled check in: ' + (checkTime - today) + ' ms' );
	}
    
	scheduleNext();
});
