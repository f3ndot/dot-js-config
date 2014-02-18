$('.commit-ref').each(function() {
	"use strict";

	var redmineRegex = "(issue|issues|feature|refactor|bug|hotfix|task)[-/]([0-9]\{5\})";

	var $el = $(this),
		text = $el.text().trim(),
		matches = text.match(redmineRegex);

	if (matches && matches.length == 3 && matches[2]) {
		var redmineid = matches[2];

		$el.after(
			$('<a>', {
				style: 'margin-left: 10px;',
				target: '_blank',
				text: 'See in Redmine',
				href: 'http://redmine/issues/' + redmineid
			})
		);
	}
});
