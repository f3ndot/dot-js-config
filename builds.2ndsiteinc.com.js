(function() {
var GIT_BASE = function(text) {
	var matches = text.match(/GIT_BASE_REPO=&#039;(.*?)&#039;<br>/);
	return matches ? matches[1] : '';
};
var GIT_HEAD = function(text) {
	var matches = text.match(/GIT_HEAD_REPO=&#039;(.*?)&#039;<br>/);
	return matches ? matches[1] : '';
};

var GITHUB_URL_toUrl = function(text) {
	var matches = text.match(/GITHUB_URL=&#039;(.*)&#039;<br>/);
	return matches ? matches[1] : '';
};

var GITHUB_URL_toPR = function(text) {
	var matches = text.match(/\/pull\/([0-9]+)&#039;<br>/);
	return matches ? matches[1] : '';
};

var GIT_SHA_short = function(text) {
	var matches = text.match(/GIT_SHA1=&#039;(.*)&#039;<br>/);
	return matches ? matches[1].slice(0, 10) : '';
};

var waiting_time = function(text) { // Waiting for 35 min
	var matches = text.match(/Waiting for (.*)/);
	return matches ? matches[1] : '';
};


var link = function(url, text) {
	return ['<a href="', url, '">', text, '</a>'].join('');
};
var right = function(text) {
	return ['<div style="float:right;">', text, '</div>'].join('');
};

var printAllHashes = function(table) {
	if (table.attr('id') != 'buildQueue') {
		return;
	}
	table.find('.pane:first-child').each(function() {
		var elem = $(this);

		var text = elem.attr('tooltip').replace(/\(StringParameterValue\) /g, '');

		var to = GIT_BASE(text), // this is the destination repo ('dev')
			from = GIT_HEAD(text), // this could be a fork
			url = GITHUB_URL_toUrl(text),
			pr = GITHUB_URL_toPR(text),
			sha = GIT_SHA_short(text),
			wait = waiting_time(text),
			repo = (to != from ? '<b>' + from + '</b>' : ''),
			output = elem.text();

		if (wait) {
			output += right(wait);
		}

		if (pr) {
			output = [
				[link(url, '# ' + pr), right(wait)].join(' '),
				[sha, right(repo)].join(' ')
			].join('<br>');
		}

		elem.html(output);
	});
};

$(document).ready(function() {
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

	var observer = new MutationObserver(function(mutations, observer) {
		// fired when a mutation occurs
		$.each(mutations, function(i, mutation) {
			if (mutation.addedNodes.length) {
				printAllHashes($(mutation.addedNodes[0]));
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

	printAllHashes($('#buildQueue'));
});
})();