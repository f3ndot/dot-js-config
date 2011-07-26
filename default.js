function include(url, callback) {
	$.ajax({
		url: url,
		dataType: 'text',
		success: function(d){
			$(function(){ eval(d) });
			callback();
		},
		error: function(){
			console.log('no dotjs server found at localhost:3131')
		}
	});
}
