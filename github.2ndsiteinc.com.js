/*global window, document, console, $ */

(function() {
	"use strict";

	var redmineBranchNameRegex = "(issue|issues|feature|refactor|bug|hotfix|task)[-/]([0-9]{5})";
	var redmineTicketInCommitRegex = new RegExp("(refs|references|IssueID|see|fixes|closes|fix) #([0-9]{5})", "i");

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

	var linkPRViewWithRedmine = function(root) {
		// get the pr source branch from the top of the page
		var needsWarning = false;
		var sourceTicket = extractTicketFromBranchName($('#pull-head .commit-ref').last());

		$('.commit', root).each(function() {
			var $el = $(this),
				message = $el.find('.message .message'),
				ticket = extractTicketFromCommit(message.attr('title'));

			if (ticket) {
				appendLinkToCommitMessage($el, makeLinkToRedmine(ticket));

				if (ticket != sourceTicket) {
					needsWarning = true; // add an error message to the top of the page!
					$el.find('.message *').css({
						color: 'rgb(193, 143, 68)' // Orange @ 50% saturation
					});
				}
			} else {
				needsWarning = true; // add an error message to the top of the page!
				$el.find('.message *').css({
					color: 'rgb(191, 64, 64)' // Red @ 50% saturation
				});
			}
		});

		if (needsWarning) {
			var commitTab = $('.tabnav-tabs.js-hard-tabs [data-container-id=commits_bucket]');
			commitTab.add(commitTab.children()).css({
				color: 'rgb(191, 64, 64)' // Red @ 50% saturation
			});
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
			'regex': /^\/dev\/freshapp\/pull\/(\d+)/,
			'msg': 'View Pull Request',
			'func': function() {
				linkPRViewWithRedmine();

				listenToChanges(document.getElementById('js-repo-pjax-container'), linkPRViewWithRedmine);
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
