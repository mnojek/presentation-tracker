function getRandomColor(color) {
	let p = 1,
		temp,
		random = Math.random(),
		result = '#';

	while (p < color.length) {
		temp = parseInt(color.slice(p, p += 2), 16)
		temp += Math.floor((255 - temp) * random);
		result += temp.toString(16).padStart(2, '0');
	}
	return result;
}

function minsToTime(mins) {
	let hours = (mins / 60);
	let rhours = Math.floor(hours);
	let minutes = (hours - rhours) * 60;
	let rminutes = Math.round(minutes);
	if (rhours > 0){
		return rhours + " h " + rminutes + " min"
	}
	return rminutes + " min";
}

$.fn.extend({
	toggleHtml: function(a, b){
		return this.html(this.html() == b ? a : b);
	},
	toggleKey: function(a, b){
		return this.attr('key', this.attr('key') == b ? a : b);
	}
});
