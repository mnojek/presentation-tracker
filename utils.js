function getRandomColor(color) {
	var p = 1,
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

function mins_to_time(mins) {
	var hours = (mins / 60);
	var rhours = Math.floor(hours);
	var minutes = (hours - rhours) * 60;
	var rminutes = Math.round(minutes);
	if (rhours > 0){
		return rhours + "h " + rminutes + "min"
	}
	return rminutes + "min";
}
