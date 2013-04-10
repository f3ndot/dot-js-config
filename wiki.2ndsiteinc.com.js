$(document).ready(function() {
	if (window.location.pathname.search(new RegExp(/pages\/editpage\.action/)) >= 0) {
		addFullHeightCSS();
	}
});


var addFullHeightCSS = function() {
	var body = document.getElementsByTagName('body')[0];
	var style = document.createElement('style');
	style.innerHTML = '.editor-fullheight { height:100%; }';
	body.appendChild(style);
};
