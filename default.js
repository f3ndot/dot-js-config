function require(file, callback) {
	return include('http://localhost:3131/'+file+'.js', callback);
}

function include(url, callback) {
	callback = callback || $.noop;
	return $.ajax({
		url: url,
		dataType: 'text',
		success: function(d){
			$(function(){
				eval(d);
			});
			callback();
		},
		error: function(){
			console.log('no dotjs server found at localhost:3131')
		}
	});
}
