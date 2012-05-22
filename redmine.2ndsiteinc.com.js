/*jslint smarttabs:true */
/*global include */

var HighlightStatus = {
	getStatusColor:function(statusText) {
		console.log('getting color for', statusText);
		switch (statusText) {
		case 'Closed':
		case 'Deployed':
			return 'rgba(0, 128, 0, .7)'; // Green
		case 'Resolved':
		case 'In Testing':
		case 'Ready for testing on Trunk':
			return 'rgba(0, 0, 255, .7)'; // Blue
		case 'Ready for testing on RC':
			return 'rgba(140, 0, 255, .7)'; // Purple
		case 'Rejected':
			return 'rgba(0, 0, 0, .7)'; // Black
		case 'New':
		case 'Assigned':
		default:
			return 'rgba(255, 0, 0, .65)'; // Red
		}
	},
	getClassMapping: function() {
		return {
			'a' : '', // anything not matched below will be given the default color
			'a.status-1': 'New',
			'a.status-3': 'Resolved',
			'a.status-4': 'Reopened',
			'a.status-5': 'Ready for testing on RC',
			'a.status-6': 'Ready for testing on Trunk',
			'a.status-7': 'In Testing',
			'a.status-8': 'Closed',
			'a.status-9': 'Rejected',
			'a.status-10': 'Deployed',
		};
	},
	getBackgroundCSSAttrs: function(text) {
		return {
			'backgroundColor':HighlightStatus.getStatusColor(text),
			'color':'white',
			'white-space': 'normal',
			'text-shadow': '0px 0px 1px #000'
		};
	},
	getForegroundCSSAttrs: function(text) {
		return {
			'color': HighlightStatus.getStatusColor(text)
		};
	},
	colorIndexRows:function() {

		var colorRows = function() {
			console.debug('coloring the rows');
			var status_field = $('table.list.issues .status').each(function() {
				$(this).css(HighlightStatus.getBackgroundCSSAttrs(
					$(this).text()
				));
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
		$('.attributes .status').css(HighlightStatus.getBackgroundCSSAttrs(
			$('.attributes .status')[1].innerText
		));
		$('#relations .status').each(function() {
			var _this = $(this);
			_this.css(HighlightStatus.getBackgroundCSSAttrs(
				this.innerText
			));

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
	},
	colorProjectSearch:function() {
		var colorRows = function() {
			$('#search-results dt a').each(function() {
				var status = $(this).text().match(/\w+ #\d+ \((\w+)\)\:/);
				$(this).css(HighlightStatus.getForegroundCSSAttrs(
					status[1]
				));
			});
		};
		$('#main').delegate('center a', 'click', function() {
			setTimeout(colorRows,  500);
			setTimeout(colorRows, 1000);
			setTimeout(colorRows, 2000);
		});
		colorRows();
	},
	colorReleaseSchedule:function() {
		var mapping = HighlightStatus.getClassMapping();
		var rows = $('.related-issues tr');
		for(var selector in mapping) {
			rows.find(selector).parent().css(HighlightStatus.getForegroundCSSAttrs(
				mapping[selector]
			));
		}
	}
};

(function($) {
	var url_mapping = [ {
		/*
		 * example:
		 * 'http://redmine.2ndsiteinc.com/projects/freshapp/issues?query_id=281'
		 * 'http://redmine.2ndsiteinc.com/issues?query_id=281'
		 */
		'regex':/\/issues(.*)/,
		'msg':'Issue Search Results',
		'func':HighlightStatus.colorIndexRows
	}, {
		/*
		 * example:
		 * 'http://redmine.2ndsiteinc.com/issues/11831'
		 */
		'regex':/^\/issues\/(\d*)/,
		'msg':'Single Issue',
		'func':HighlightStatus.colorSingleIssue
	}, {
		'regex':/^\/search\/index\/(.*)/,
		'msg':'Project Search Results',
		'func':HighlightStatus.colorProjectSearch
	}, {
		'regex':/^\/versions\/(.*)|^\/versions\/show\/(.*)|\/projects\/(.+)\/roadmap/,
		'msg':'Release Schedule',
		'func':HighlightStatus.colorReleaseSchedule
	} ];

	$(document).ready(function() {
		for(var i in url_mapping) {
			var mapping = url_mapping[i];
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
	 } else if (days === 1) {
		  return baseDate + " (Tomorrow)";
	 } else if (days === 0) {
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



