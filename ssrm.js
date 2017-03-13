$(document).ready(function() {
    chrome.runtime.sendMessage({
        type: 'getLocalStorage'
    }, function(value) {
        var HOURS_PER_DAY = +value.work_hours || 8;
        
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
        var j = 0;
        
        var workedHours = 0;
        var totalHours = 0;
        var persHours = 0;
        
        var monthWorkedHours = 0;
        var monthTotalHours = 0;
        var monthPersHours = 0;
        
        var date;
        for (var i = 0; i < entries.length; ++i) {
            
            if (entries[i].className == "odd") {
                date = $('td', entries[i])[0].textContent;
                if (date == 'Today') {
                    todayMissing = false;
                    date = new Date();
                } else {
                    date = date.split(".");
                    date = new Date(date[2],date[1] - 1,date[0]);
                }
                workedHours += HOURS_PER_DAY;
                totalHours += Number($('.hours', entries[i])[0].textContent);
                if (date.getMonth() == today.getMonth()) {
                    monthTotalHours += Number($('.hours', entries[i])[0].textContent);
                    monthWorkedHours += HOURS_PER_DAY;
                }
            
            } else if (entries[i].className == "time-entry") {
                if ($('.subject', entries[i])[0].textContent.indexOf('Personal Issue') >= 0) {
                    persHours += Number($('.hours', entries[i])[0].textContent);
                    if (date.getMonth() == today.getMonth()) {
                        monthPersHours += Number($('.hours', entries[i])[0].textContent);
                    }
                }
            }
        
        }
        
        $('.total-hours').append("<p>This month: " + toHours(monthTotalHours) + " / Personal issues: " + toHours(monthPersHours) + " / Surplus: " + toHours(monthTotalHours - (monthWorkedHours + monthPersHours)) + (todayMissing ? "<span style=\"color: red;\"> Missing today! </span>" : "") + "</p>" + 
        "<p>Total hours displayed: " + toHours(totalHours) + " / Personal issues: " + toHours(persHours) + " / Surplus: " + toHours(totalHours - (workedHours + persHours)) + "</p>"
        );
    
    }
    );
}
);
