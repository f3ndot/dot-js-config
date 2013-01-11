(function() {
"use strict";

var matches = function(regex) {
	return function(text) {
		var match = text.match(regex);
		return match ? match[1] : '';
	};
};

var git_base = matches(/GIT_BASE_REPO=&#039;(.*?)&#039;<br>/),
	git_head = matches(/GIT_HEAD_REPO=&#039;(.*?)&#039;<br>/),
	github_url_toUrl = matches(/GITHUB_URL=&#039;(.*)&#039;<br>/),
	github_url_toPR = matches(/\/pull\/([0-9]+)&#039;<br>/),
	git_sha_short = function(text) {
		return matches(/GIT_SHA1=&#039;(.*)&#039;<br>/)(text).slice(0, 10);
	},
	waiting_time = matches(/Waiting for (.*)/),
	started = matches(/Started (.*?) ago/),
	estimated = matches(/Estimated remaining time: (.*)/);

var link = function(url, text) {
	return ['<a href="', url, '" target="_parent">', text, '</a>'].join('');
};
var right = function(text) {
	return ['<div style="float:right;">', text, '</div>'].join('');
};

var rewriteBuildQueue = function(table) {
	table.find('.pane:first-child a').each(function() {
		var elem = $(this);

		var text = elem.attr('tooltip').replace(/\(StringParameterValue\) /g, '');

		var to = git_base(text), // this is the destination repo ('dev')
			from = git_head(text), // this could be a fork
			url = github_url_toUrl(text),
			pr = github_url_toPR(text),
			sha = git_sha_short(text),
			wait = waiting_time(text),
			repo = (to != from ? from : ''),
			output = elem.text();

		if (wait) {
			output += right(wait);
		}

		if (pr) {
			var parent = elem.closest('tr').attr('data-pr', pr);
			var siblings = parent.siblings('[data-pr=' + pr + ']')
				.css({backgroundColor: 'rgba(255, 0, 0, .1)'});
			if (siblings.length) {
				elem.parent().css({backgroundColor: 'rgba(0, 0, 255, .05)'});
			}
			output = [
				[link(url, '# ' + pr), right(sha)].join(' '),
				['+' + wait, right(repo)].join(' ')
			].join('<br>');
		}
		elem.closest('tr').attr('data-pr', pr);

		elem.html(output);
	});
};

var rewriteExeutorsList = function(table) {
	table.find('.pane:nth-child(2) div').each(function() {
		var elem = $(this);

		var tooltip = elem.find('.progress-bar').attr('tooltip');
		if (!tooltip) {
			return;
		}

		elem.append(['+', started(tooltip), right('-' + estimated(tooltip))].join(''));
	});
};

$(document).ready(function() {
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

	var observer = new MutationObserver(function(mutations) {
		// fired when a mutation occurs
		$.each(mutations, function(i, mutation) {
			if (mutation.addedNodes.length) {
				var node = $(mutation.addedNodes[0]);
				if (node.attr('id') == 'buildQueue') {
					rewriteBuildQueue(node);
				} else if (node.attr('id') == 'executors') {
					rewriteExeutorsList(node);
				}
			}
		});
	});

	// define what element should be observed by the observer
	// and what types of mutations trigger the callback
	observer.observe(document.getElementById('navigation'), {
		subtree: false,
		childList: true,
		attributes: false
	});

	rewriteBuildQueue($('#buildQueue'));
	rewriteExeutorsList($('#executors'));
});
})();