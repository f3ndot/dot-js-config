$('head').append(
	$('<style>', {
		html: '\
			.link-to-redmine {\
				margin-left: 10px;\
				padding: 5px;\
				border-radius: 3px;\
			}\
			.link-to-redmine:hover {\
				background: #628DB6;\
				color: white;\
			}\
		'
	})
);

$('.commit-ref, .branch-name').each(function() {
	"use strict";

	var redmineRegex = "(issue|issues|feature|refactor|bug|hotfix|task)[-/]([0-9]\{5\})";

	var $el = $(this),
		text = $el.text().trim(),
		matches = text.match(redmineRegex);

	if (matches && matches.length == 3 && matches[2]) {
		var redmineid = matches[2];

		$el.after(
			$('<a>', {
				'class': 'link-to-redmine',
				target: '_blank',
				text: 'See in Redmine',
				href: 'http://redmine/issues/' + redmineid
			})
		);
	}
});
