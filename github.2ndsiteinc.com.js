(function() {
	"use strict";

	var includeSexyStyles = function() {
		$('head').append(
			$('<style>', {
				html:[".link-to-redmine {",
						"margin-left: 5px;",
						"margin-right: 5px;",
						"padding: 5px;",
						"border-radius: 3px;",
					"}",
					".link-to-redmine:hover {",
						"background: #628DB6;",
						"color: white;",
					"}"].join("\n")
			})
		);
	};

	var linkUpTheBranchNames = function(root) {
		$('.commit-ref, .branch-name', root).each(function() {
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
	};

	var listenToChanges = function(whatsChanging, whatHappens) {
		if (!whatsChanging) {
			return;
		}

		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				$.each(mutation.addedNodes, function() {
					// Skip text nodes, and non-node elements (like comments);
					if (this.nodeType && this.nodeType !== 3) {
						whatHappens(this);
					}
				});
			});
		});

		// define what element should be observed by the observer
		// and what types of mutations trigger the callback
		observer.observe(whatsChanging, {
			subtree: false,
			childList: true,
			attributes: false
		});
	};

	$(document).ready(function() {
		includeSexyStyles();
		linkUpTheBranchNames();

		listenToChanges(document.getElementById('pull-head'), function(node) {
			linkUpTheBranchNames(node);
		});

		listenToChanges(document.getElementById('js-repo-pjax-container'), function(node) {
			linkUpTheBranchNames(node);
		});
	});

})();
