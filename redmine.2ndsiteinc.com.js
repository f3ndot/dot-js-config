window.HighlightStatus = {
	getStatusColor:function(statusText) {
		switch (statusText) {
		case 'Closed':
		case 'Deployed':
			return 'green';
		case 'Resolved':
		case 'In Testing':
			return 'blue';
		case 'Rejected':
			return 'black';
		case 'New':
		case 'Assigned':
		default:
			return 'red';
		}
	},
	colorIndexRows:function() {
		var colorRows = function() {
			console.debug('coloring the rows');
			var status_field = $('table.list.issues .status').each(function() {
				$(this).css({
					'backgroundColor':HighlightStatus.getStatusColor($(this).text()),
					'color':'white'
				});
			});
		};
		
		$('#content').delegate('.pagination a', 'click', function() {
			setTimeout(colorRows,  500);
			setTimeout(colorRows, 1000);
			setTimeout(colorRows, 2000);
		});
		$('#query_form .buttons a').click(function() {
			setTimeout(colorRows,  500);
			setTimeout(colorRows, 1000);
			setTimeout(colorRows, 2000);
		});
		
		colorRows();
	},
	colorSingleIssue:function() {
		var status = $('.status')[1];
		$('.status').css({
			'backgroundColor':HighlightStatus.getStatusColor(status.innerText),
			'color':'white'
		});
		include('/plugin_assets/redmine_statusboard/javascripts/strftime.js', function() {
			$.getJSON('/statusboard/versions', function(data) {
				console.debug(data);
				for(var i in data) {
					var obj = data[i];
					var release_name = $('td.fixed-version');
					if (release_name.text().indexOf(obj.name) >= 0) {
						$('<p>').text( formatReleaseDate(obj.date) ).wrapInner('<b>').appendTo(release_name);
					}
				}
			});
		});
	}
};

(function($) {
	var url_mapping = [ {
		'regex':/^\/projects\/(\w*)\/issues(.*)/, // example: 'http://redmine.2ndsiteinc.com/projects/freshapp/issues?query_id=281',
		'msg':'Issue Search Results',
		'func':HighlightStatus.colorIndexRows
	}, {
		'regex':/^\/issues\/(\d*)/, // example: 'http://redmine.2ndsiteinc.com/issues/11831'
		'msg':'Single Issue',
		'func':HighlightStatus.colorSingleIssue
	} ];
	
	$(document).ready(function() {
		for(var i in url_mapping) {
			mapping = url_mapping[i];
			if (window.location.pathname.search(new RegExp(mapping.regex)) >= 0) {
				console.debug(window.location.pathname, 'matches', mapping.regex);
				console.debug(mapping.msg);
				mapping.func();
			}
		}
	});
})(jQuery);



function formatPastReleaseDate(date) {
	 return date.strftime("%a, %B %e, %Y");
}

function formatFutureReleaseDate(now, date) {
	 var baseDate = formatPastReleaseDate(date);
	 
	 var millis = date - now;
	 
	 var seconds = millis / 1000;
	 var minutes = seconds / 60;
	 var hours = minutes / 60;
	 var days = Math.ceil(hours / 24);

	 if (days > 1) {
		  return baseDate + " (" + days + " days)";
	 } else if (days == 1) {
		  return baseDate + " (Tomorrow)";
	 } else if (days == 0) {
		  return baseDate + " (Today)";
	 } else {
		  return baseDate + " (" + Math.abs(days) + " days ago)";
	 }
}

function today() {
	 var now = new Date();
	 now.setHours(0);
	 now.setMinutes(0);
	 now.setSeconds(0);
	 now.setMilliseconds(0);
	 return now;
}

function formatReleaseDate(date) {
	 var now = today();
	 var then = new Date();
	 then.setISO8601Date(date);
	 
	 if (then < now) {
		  return formatPastReleaseDate(then);
	 }
	 return formatFutureReleaseDate(now, then);
}



