let arrLang = {
	"pl-PL": {
		"duration" : "Czas trwania:",
		"date" : "Termin:",
		"start-btn": "Start",
		"pause-btn": "Pauza",
		"wrong_module_time_warn": "Uwaga! Suma czasu tematów modułu jest różna od czasu trwania modułu",
		"wrong_pr_time_warn": "Uwaga! Suma czasu wszystkich modułów jest różna od czasu trwania kursu. Popraw plik \"data.js\""
	},
	"en-US": {
		"duration" : "Duration:",
		"date" : "Date:",
		"start-btn": "Start",
		"pause-btn": "Pause",
		"wrong_module_time_warn": "Warning! Duration of all topics from module does not equal module duration",
		"wrong_pr_time_warn": "Warning! Duration of all modules does not equal presentation duration. Fix file 'data.js'"
	}
}

let langMapping = {
	"pl-PL": "Polski",
	"en-US": "English"
}

window.onload = initialize;

function initialize() {
	var $dropdown = $("#lang_select");    
	$.each(langMapping, function(key, value) {
		$dropdown.
			append($("<option/>").
			val(key).
			text(value));
	});
	let lang = $("#lang_select").val();
	localStorage.setItem('language', lang);
	changeLanguage(lang);
}

function changeLanguage(lang){
	localStorage.setItem('language', lang);
	$('.lang').each(function(index,element){
		$(this).text(arrLang[lang][$(this).attr('key')]);
	});
	let pr_date = new Date(data.presentation.date).toLocaleDateString(lang, {  
		day : 'numeric',
		month : 'long',
		year : 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
	$('#pr_time').text(pr_date);
}

function getLanguagePhrase(lang, key) {
	return arrLang[lang][key];
}
