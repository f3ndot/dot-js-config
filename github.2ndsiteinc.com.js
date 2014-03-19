/*global window, document, console, $, _ */

(function() {
	"use strict";

	var redmineBranchNameRegex = "(issue|issues|feature|refactor|bug|hotfix|task)[-/]([0-9]{5})";
	var redmineTicketInCommitRegex = new RegExp("(refs|references|IssueID|see|fixes|closes|fix):? #([0-9]{5})", "i");

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
						"color: white !important;",
					"}"].join("\n")
			})
		);
	};

	var extractTicketBuilder = function(regex) {
		return function($el) {
			var text = (typeof($el) == 'string' ? $el : $el.text().trim()),
				matches = text.match(regex);

			if (matches && matches.length == 3 && matches[2]) {
				return matches[2];
			}
		};
	};

	var extractTicketFromBranchName = extractTicketBuilder(redmineBranchNameRegex);
	var extractTicketFromCommit = extractTicketBuilder(redmineTicketInCommitRegex);

	var makeLinkToRedmine = function(redmineid) {
		return $('<a>', {
			'class': 'link-to-redmine',
			target: '_blank',
			text: 'See in Redmine',
			href: 'http://redmine/issues/' + redmineid
		});
	};

	var linkUpTheBranchNames = function(root) {
		$('.commit-ref, .branch-name', root).each(function() {
			var $el = $(this),
				redmineid = extractTicketFromBranchName($el);

			if (redmineid) {
				$el.after(makeLinkToRedmine(redmineid));
			}
		});
	};

	var appendLinkToCommitMessage = function($el, link) {
		if ($el.find('.commit-desc').length) {
			$el.find('.commit-desc')
				.css({'position': 'relative'})
				.append(
					link.css({
						'position': 'absolute',
						'right': 0,
						'bottom': 0
					})
				);
		} else {
			$el.find('td.message')
				.append(
					link.css({
						'float': 'right',
						'marginLeft': '-5px'
					})
				);
		}
	};

	var commitMessageHasError = function($el, sourceTicket) {
		var message = $el.find('.message .message'),
			ticket = extractTicketFromCommit(message.attr('title'));

		if (ticket) {
			appendLinkToCommitMessage($el, makeLinkToRedmine(ticket));

			if (ticket != sourceTicket) {
				$el.find('.message *').css({
					color: 'rgb(193, 143, 68)' // Orange @ 50% saturation
				});
				return true;
			}
		} else {
			$el.find('.message *').css({
				color: 'rgb(191, 64, 64)' // Red @ 50% saturation
			});
			return true;
		}
		return false;
	};

	var highlightCommitsInError = function(root, sourceTicket) {
		return $('.commit', root).map(function() {
			return commitMessageHasError($(this), sourceTicket);
		});
	};

	var doesNeedGlobalWarning = function(commitsWithErrors) {
		return commitsWithErrors.toArray().reduce(function(hasError, memo) {
			return hasError || memo;
		}, false);
	};

	var addErrorColorToElem = function($el) {
		$el.add($el.find('*')).css({
			color: 'rgb(191, 64, 64)' // Red @ 50% saturation
		});
	};

	var linkPRViewWithRedmine = function(root) {
		// get the pr source branch from the top of the page
		var sourceTicket = extractTicketFromBranchName($('#pull-head .commit-ref').last());

		if (doesNeedGlobalWarning(highlightCommitsInError(root, sourceTicket))) {
			var commitTab = $('.tabnav-tabs.js-hard-tabs [data-container-id=commits_bucket]');
			addErrorColorToElem(commitTab);
		}
	};

	var linkBranchCompareWithRedmine = function(root) {
		// get the compare branch from the top of the page
		var sourceTicket = extractTicketFromBranchName($('#js-repo-pjax-container .branch-name').last().text().trim());

		if (doesNeedGlobalWarning(highlightCommitsInError(root, sourceTicket))) {
			var summaryList = $('.numbers-summary');
			addErrorColorToElem(summaryList);
		}
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

	var highlightDiffExplain = function(root) {
		var elems = $('#diff .explain, #diff .explain *', root).not('a'),
			text = elems.text(),
			regex = /(\d+) changed files(\d+) additions(\d+) deletions/,
			matches = text.match(regex);
		if (matches.length != 4) {
			console.log("Couldn't find the Diff Explain section to highlight long PR's");
			return;
		}

		var files = parseInt(matches[1], 10),
			additions = parseInt(matches[2], 10),
			deletions = parseInt(matches[3], 10),
			totalLines = additions + deletions;

		colorElementIfTooManyLinesChanges(elems, totalLines);
	};

	var highlightPullHeadLinesChanges = function(root) {
		var elem = $('.pull-head-meta .diffstat'),
			linesChanged = parseInt(elem.text(), 10);

		console.log(elem, linesChanged);
		colorElementIfTooManyLinesChanges(elem, linesChanged, {invert: true});
	}

	var colorElementIfTooManyLinesChanges = function($el, totalLines, options) {
		options = options || {
			invert: false
		};

		var red = 'rgb(191, 64, 64)', // Red @ 50% saturation
			orange = 'rgb(193, 143, 68)',  // Orange @ 50% saturation
			white = 'white';
			color = null;

		if (totalLines > 1000) {
			color = red;
		} else if (totalLines > 800) {
			color = orange;
		}

		if (options.invert) {
			$el.css({
				background: color,
				color: white
			});
		} else {
			$el.css({
				color: color
			});
		}
	};

	$(document).ready(function() {
		var urlMapping = [{
			'regex': '.*',
			'msg': 'Any Page',
			'func': function() {
				includeSexyStyles();
				linkUpTheBranchNames();

				// this is the main body that contains the PR 'tab' (list and item views)
				listenToChanges(document.getElementById('js-repo-pjax-container'), linkUpTheBranchNames);
			}
		}, {
			'regex': /^\/dev\/([a-zA-Z\-]+)\/pull\/(\d+)/,
			'msg': 'View Pull Request',
			'func': function() {
				linkPRViewWithRedmine();
				highlightDiffExplain();
				highlightPullHeadLinesChanges();

				listenToChanges(document.getElementById('js-repo-pjax-container'), linkPRViewWithRedmine);
				listenToChanges(document.getElementById('js-repo-pjax-container'), highlightDiffExplain);
				listenToChanges(document.getElementById('js-repo-pjax-container'), highlightPullHeadLinesChanges);
			}
		}, {
			'regex': /^\/dev\/([a-zA-Z\-]+)\/compare\/.*/,
			'msg': 'Compare Branch',
			'func': function() {
				linkBranchCompareWithRedmine();
				highlightDiffExplain();

				listenToChanges(document.getElementById('js-repo-pjax-container'), linkBranchCompareWithRedmine);
				listenToChanges(document.getElementById('js-repo-pjax-container'), highlightDiffExplain);
			}
		}];

		for (var i in urlMapping) {
			var mapping = urlMapping[i];
			if (window.location.pathname.search(new RegExp(mapping.regex)) >= 0) {
				console.debug(window.location.pathname, 'matches', mapping.regex);
				console.debug(mapping.msg);
				mapping.func();
			}
		}
	});

})();
