// TODO:
// startowanie i pauzowanie czasu
// ładniejsze wyświetlanie informacji o kursie
// wskaźnik bieżącego modułu
// obsługa zbyt podobnych kolorów tematów
// obsługa oddzielnych dni kursu (przełącznie pomiędzy innymi htmlami i danymi zależnymi od dnia)

function update_labels(){
	$('#pr_title').text(data.presentation.title);
	$('#pr_subtitle').text(data.presentation.subtitle);
	$('#pr_duration').text("Długość trwania: " + mins_to_time(data.presentation.duration));
	let pr_date = new Date(data.presentation.date).toLocaleDateString('pl-PL', {  
		day : 'numeric',
		month : 'long',
		year : 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
	$('#pr_time').text("Termin: " + pr_date);
}

function create_progress_bars(){
	let first = true;
	for (module of data.presentation.modules){
		modul_div = $('<div/>', {
			class: 'progress-bar',
			text: module.label + " ",
			style: `width:${module.time / data.presentation.duration * 100}%; background-color:${module.color} !important;`
		});
		badge = $('<span/>', {
			class: 'badge',
			text: module.time + " min"
		});
		modul_div.append(badge);
		modul_div.appendTo('#progress_parent');
		
		if (first) {
			first = false;
			update_mod_progress_bar(module);
		}
	}
}

function create_break_progress_bar(module){
	break_div = $('<div/>', {
		class: 'progress-bar',
		text: module.label + " ",
		style: `width:${module.time / module.time * 100}%; background-color: #cccccc !important;`
	});
	break_div.appendTo('#mod_progress');
}

function create_mod_progress_bars(module){
	for (topic of module.topics){
		topic_div = $('<div/>', {
			class: 'progress-bar',
			text: topic.label + " ",
			style: `width:${topic.time / module.time * 100}%; background-color:${getRandomColor(module.color)} !important;`
		});
		badge = $('<span/>', {
			class: 'badge',
			text: topic.time + " min"
		});
		topic_div.append(badge);
		topic_div.appendTo('#mod_progress');
	}
}

function update_mod_progress_bar(module) {
	$('#mod_progress').children('.progress-bar').remove();
	
	if (module.type == "break") {
		create_break_progress_bar(module);
	}
	else {
		create_mod_progress_bars(module);
	}
	tag_current_module(module);
}

function get_current_module(progress, start_times, blink_flags){
	let current_module = null;
	let preblink_time = 5;
	for (var i = 0; i < start_times.length; i++){
		if (i != 0) {	// do not blink for the first module
			blink_time = ((start_times[i] / 100 * data.presentation.duration * 60) - preblink_time) / 60 / data.presentation.duration * 100;  // change % module starts to time in seconds
			if (progress >= blink_time){
				if (blink_flags[i] == false){
					$('body').effect("highlight", {color: 'green'}, 1000);
					blink_flags[i] = true;
				}
			}
		}
		
		if (progress >= start_times[i]){
			current_module = data.presentation.modules[i];
		}
		else {
			break;
		}
	}
	return current_module;
}

function calculate_progress(elapsed_time, duration) {
	let duration_ms = duration * 60 * 1000;
	let progress = (elapsed_time / duration_ms * 100);
	return progress;
}

function update_elapsed_time(elapsed_time) {
	let pr_elapsed_time = new Date(0);
	pr_elapsed_time.setMilliseconds(elapsed_time - (60 * 60 * 1000));
	iso_elapsed_time = pr_elapsed_time.toISOString();
	let formattedTime = pr_elapsed_time.getHours() > 0 ? iso_elapsed_time.substr(11, 8) : iso_elapsed_time.substr(14, 5);
	$('#pr_elapsed_time').css('display', 'block').text(formattedTime);
}

function get_modules_start_times(){
	let starting_time = 0;
	let start_times = [];
	let modules_time_sum = 0;
	for (module of data.presentation.modules){
		start_times.push(starting_time)
		starting_time += module.time / data.presentation.duration * 100;
		modules_time_sum += module.time;
		
		if (module.type != 'break') {
			var topics_time_sum = 0;
			for (topic of module.topics) {
				topics_time_sum += topic.time;
			}
			if (topics_time_sum != module.time) {
				$('#wrong_mod_time_warning').css('display', 'block').text(`Uwaga! Suma czasu tematów z modułu '${module.label}' jest różna od czasu trwania modułu`);
			}
		}
	}
	if (modules_time_sum != data.presentation.duration){
		$('#wrong_time_warning').css('display', 'block').text('Uwaga! Suma czasu wszystkich modułów jest różna od czasu trwania kursu');
	}
	return start_times;
}

function tag_current_module(module) {
	$('#progress_parent').children('.progress-bar').children('a').contents().unwrap();
	$('.tooltip').remove();
	let idx = -1;
	for (var i = 0; i < data.presentation.modules.length; i++) {
		if (data.presentation.modules[i] == module) {
			idx = i;
			break;
		}
	}
	tooltip = $('<a/>', {
		"href": "#",
		"id": "mod_tooltip",
		"data-toggle": "tooltip",
		"data-placement": "bottom",
		"data-container": ".container",
		"title": "Obecny moduł"
	});
	$('#progress_parent').children('.progress-bar').eq(idx).wrapInner(tooltip);
}

$(document).ready(function() {

	$(this).attr("title", data.presentation.title);
	update_labels();
	create_progress_bars();
	var start_times = get_modules_start_times();
	var blink_flags = Array(start_times.length).fill(false);

	var start = null;
	var last_module = null;
	var elapsed_modules = 0;
	
	function step(timestamp) {
		if (!start) start = timestamp;
		let elapsed_time = timestamp - start;
		
		let pr_progress_percentage = calculate_progress(elapsed_time, data.presentation.duration);
		$('#pr_indicator').css('left', `${pr_progress_percentage}%`);
		$('#pr_elapsed_part').css('width', `${pr_progress_percentage}%`);
		
		current_module = get_current_module(pr_progress_percentage, start_times, blink_flags);

		if (last_module && (current_module != last_module)) {
			update_mod_progress_bar(current_module);
			$(function () { $('[data-toggle="tooltip"]').tooltip({trigger: 'manual'}).tooltip('show'); });
			elapsed_modules += last_module.time * 60 * 1000;
		}
		let mod_progress = elapsed_time - elapsed_modules;
		
		let mod_progress_percentage = calculate_progress(mod_progress, current_module.time);
		$('#mod_indicator').css('left', `${mod_progress_percentage}%`);
		$('#mod_elapsed_part').css('width', `${mod_progress_percentage}%`);

		update_elapsed_time(elapsed_time);
		
		let pr_duration_ms = data.presentation.duration * 60 * 1000
		if (elapsed_time < pr_duration_ms) window.requestAnimationFrame(step);
		
		last_module = current_module;
	};
	
	$('#start_button').click(function() {
		window.requestAnimationFrame(step);
		$(function () { $('[data-toggle="tooltip"]').tooltip({trigger: 'manual'}).tooltip('show'); });
	});
});
