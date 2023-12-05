function getLocalStorage(key, fallback, callback) {
    chrome.storage.local.get(key).then(val => {
        if (val[key] !== undefined) {
            callback(val[key]);
        } else {
            callback(fallback);
        }
    });
}

$(document).ready(function () {
    getLocalStorage("work_hours", 8, work_hours => {
        var HOURS_PER_DAY = +work_hours || 8;
        
        String.prototype.rpad = function(padString, length) {
            var str = this;
            while (str.length < length)
                str = str + padString;
            return str;
        }
        
        var toHours = function(hour) {
            return "<span class=\"hours hours-int\">" + Math.floor(hour) + "</span><span class=\"hours hours-dec\">." + (String(hour).split(".")[1] ? String(hour).split(".")[1].rpad('0', 2).substring(0, 2) : "00") + "</span>";
        }
        var todayMissing = true;
        
        var today = new Date();
        var entries = $('tbody', $('.time-entries')).children();
        
        var workedHours = 0;
        var totalHours = 0;
        
        var monthWorkedHours = 0;
        var monthTotalHours = 0;
        
        var date;
        for (var i = 0; i < entries.length; ++i) {
            
            if (entries[i].className == "odd") {
                var dateString = $('td', entries[i])[0].textContent;
                var split = dateString.split(".");
                var date = new Date(split[2], split[1] - 1, split[0]);
                if (isNaN(date.getTime())) {
                    date = new Date();
                    todayMissing = false;
                }
                
                workedHours += HOURS_PER_DAY;
                totalHours += Number($('.hours', entries[i])[0].textContent);
                if (date.getMonth() == today.getMonth()) {
                    monthTotalHours += Number($('.hours', entries[i])[0].textContent);
                    monthWorkedHours += HOURS_PER_DAY;
                }
            
            } else if (entries[i].className == "time-entry") {
                $('td[align=center]', entries[i]).append('<a href="' + $('.subject a', entries[i])[0].href + '/time_entries/new"><img src="/images/add.png"></a>');	
            }
            
        
        }
        
        $('.total-hours').append("<p>This month: " + toHours(monthTotalHours) + " / Surplus: " + toHours(monthTotalHours - monthWorkedHours) + (todayMissing ? "<span style=\"color: red;\"> Missing today! </span>" : "") + "</p>" + 
        "<p>Total hours displayed: " + toHours(totalHours) + " / Surplus: " + toHours(totalHours - workedHours) + "</p>"
        );
    
    }
    );
}
);
