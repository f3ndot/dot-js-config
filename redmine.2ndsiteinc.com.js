(function($) {
	var url_mapping = [ {
		'regex':/^\/issues\/(\d*)/, // 'http://redmine.2ndsiteinc.com/issues/11831'
		'msg':'Single Issue',
		'func':function() {
			var status = $('.status')[1],
				styles = getStyle(status.innerText);
			
			styles.color = 'white';
			$('.status').css(styles);
		}
	}, {
		'regex':/^\/projects\/(\w*)\/issues(.*)/, // 'http://redmine.2ndsiteinc.com/projects/freshapp/issues?query_id=281',
		'msg':'Issue Search Results',
		'func':function() {
			var status_field = $('table.list.issues .status').each(function() {
				var self = $(this),
					styles = getStyle(self.text());
				styles.color = 'white';
				self.css( styles );
			});
		}
	} ];
	
	for(var i in url_mapping) {
		mapping = url_mapping[i];
		
		if (window.location.pathname.search(new RegExp(mapping.regex)) >= 0) {
			console.debug(window.location.pathname, 'matches', mapping.regex);
			console.debug(mapping.msg);
			mapping.func();
		}
	}
	
	function getStyle(statusText) {
		switch (statusText) {
		case 'Closed':
		case 'Deployed':
			return {'background':'green'};
		case 'Resolved':
		case 'In Testing':
			return {'background':'blue'};
		case 'Rejected':
			return {'background':'blue'};
		default:
			return {'background':'red'};
		}
	}
})(jQuery);
