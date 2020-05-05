// TODO:
// startowanie i pauzowanie czasu
// obsługa zbyt podobnych kolorów tematów
// obsługa oddzielnych dni kursu (przełącznie pomiędzy innymi htmlami i danymi zależnymi od dnia)

function update_labels(){
	$(document).attr("title", data.presentation.title);
	$('#pr_title').text(data.presentation.title);
	$('#pr_subtitle').text(data.presentation.subtitle);
	$('#pr_duration').text(mins_to_time(data.presentation.duration));
	let pr_date = new Date(data.presentation.date).toLocaleDateString('pl-PL', {  
		day : 'numeric',
		month : 'long',
		year : 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
	$('#pr_time').text(pr_date);
}

function create_label(module, width, parent_div) {
	let mod_label_div = $('<div/>', {
		class: 'pr_label',
		text: module.label + " ",
		style: `width:${width}%;`
	});
	let badge = $('<span/>', {
		class: 'badge',
		text: module.duration + " min"
	});
	mod_label_div.append(badge);
	mod_label_div.appendTo(parent_div);
}

function create_progress_bars(){
	for (let module of data.presentation.modules){
		let module_width = module.duration / data.presentation.duration * 100;
		create_label(module, module_width, '#pr_labels');

		let glyph = $('<span/>', {
			class : 'glyphicon'
		}).addClass('glyphicon-time');

		let progress_bar = $('<div/>', {
			class: 'progress-bar',
			style: `width:${module_width}%;
					background-color:${module.color} !important;`
		});
		
		if (module.type == "break") progress_bar.append(glyph);
		progress_bar.appendTo('#pr_progress');
	}
}

function create_break_progress_bar(module){
	create_label(module, 100, mod_labels);
	
	let break_progress_bar = $('<div/>', {
		class: 'progress-bar',
		style: `width:100%;
				background-color: #cccccc !important;`
	});
	let glyph = $('<span/>', {
		class : 'glyphicon'
	}).addClass('glyphicon-time');
	break_progress_bar.append(glyph);
	break_progress_bar.appendTo('#mod_progress');
}

function create_mod_progress_bars(module){
	if (module.type == "break") {
		create_break_progress_bar(module);
		return;
	}
	// only module type modules have topics
	for (let topic of module.topics){
		let topic_width = topic.duration / module.duration * 100;
		create_label(topic, topic_width, '#mod_labels');

		let topic_progress_bar = $('<div/>', {
			class: 'progress-bar',
			style: `width:${topic_width}%; 
					background-color:${getRandomColor(module.color)} !important;`
		});
		topic_progress_bar.appendTo('#mod_progress');
	}
}

function tag_current_module(module, start_times) {
	let idx = data.presentation.modules.indexOf(module);
	// calculate new tag position as half of current module width
	// and adjust it by tag width
	let next_mod_exists = typeof start_times[idx+1] === 'undefined';
	let next_mod_start_time = next_mod_exists ? 100 : start_times[idx+1];
	let new_tag_position = next_mod_start_time - ((next_mod_start_time - start_times[idx]) / 2);
	let tag_width = 20;
	$('#module_arrow').css('left', `${new_tag_position}%`).css('margin-left', `-${tag_width}px`);
}

function update_mod_progress_bar(module) {
	$('#mod_progress').children('.progress-bar').remove();
	$('#mod_labels').children().remove();
	create_mod_progress_bars(module);
}

function blink_before_module_ends(progress, start_times, blink_flags) {
	let first_blink = -6,  // seconds before module ends
		blink_timeouts = [3000, 2000, 1000],  // array with blink times after first blink
		blink_color = 'green',
		blink_duration = 500; // in ms
	for (var i = 1; i < start_times.length; i++){
		if (blink_flags[i] == true) continue; // do not blink for the first module
		let blink_time = ((start_times[i] / 100 * data.presentation.duration * 60) + first_blink) / 60 / data.presentation.duration * 100;  // calculate blink time as % of module progress
		if (progress < blink_time) return;
		$('body').effect("highlight", {color: 'green'}, 500);
		let timeout_ms = 0;
		for (let blink_timeout of blink_timeouts) {
			timeout_ms += blink_timeout;
			setTimeout(function(){ $('body').effect("highlight", {color: blink_color}, blink_duration); }, timeout_ms);
		}
		blink_flags[i] = true;
	}
}

function get_current_module(progress, start_times){
	let current_module = null;
	for (var i = 0; i < start_times.length; i++){
		if (progress >= start_times[i]) current_module = data.presentation.modules[i];
		else break;
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
	let iso_elapsed_time = pr_elapsed_time.toISOString();
	let formattedTime = pr_elapsed_time.getHours() > 0
		? iso_elapsed_time.substr(11, 8) // display hours and minutes
		: iso_elapsed_time.substr(14, 5); // display only minutes
	$('#pr_elapsed_time').text(formattedTime);
}

function validate_topics_duration(module){
	if (module.type == 'break') return;  // break type modules have no topics
	
	let topics_time_sum = module.topics.reduce((a, b) => a.duration + b.duration);
	if (topics_time_sum != module.duration) {
		$('#wrong_mod_time_warning').css('display', 'block').text(`Uwaga! Suma czasu tematów z modułu '${module.label}' jest różna od czasu trwania modułu`);
	}
}

function get_modules_start_times(){
	let starting_time = 0,
		start_times = [],
		modules_time_sum = 0;
	for (let module of data.presentation.modules){
		start_times.push(starting_time)
		starting_time += module.duration / data.presentation.duration * 100;
		modules_time_sum += module.duration;
		
		validate_topics_duration(module);
	}
	if (modules_time_sum != data.presentation.duration){
		$('#wrong_time_warning').css('display', 'block').text('Uwaga! Suma czasu wszystkich modułów jest różna od czasu trwania kursu. Popraw plik data.js');
	}
	return start_times;
}

function move_pr_indicator(progress) {
	$('#pr_indicator').css('left', `${progress}%`);
	$('#pr_elapsed_part').css('width', `${progress}%`);
}

function move_mod_indicator(progress) {
	$('#mod_indicator').css('left', `${progress}%`);
	$('#mod_elapsed_part').css('width', `${progress}%`);
}

$(document).ready(function() {

	update_labels();
	create_progress_bars();
	update_mod_progress_bar(data.presentation.modules[0]);
	var start_times = get_modules_start_times();
	tag_current_module(data.presentation.modules[0], start_times);
	var blink_flags = Array(start_times.length).fill(false);
	blink_flags[0] = true;

	var start = null,
		last_module = null,
		elapsed_modules = 0;
	
	function step(timestamp) {
		if (!start) start = timestamp;
		let elapsed_time = timestamp - start;
		
		update_elapsed_time(elapsed_time);
		
		// calculate the position of presentation progress indicator
		let pr_progress_percentage = calculate_progress(elapsed_time, data.presentation.duration);
		move_pr_indicator(pr_progress_percentage);
		
		blink_before_module_ends(pr_progress_percentage, start_times, blink_flags);
		let current_module = get_current_module(pr_progress_percentage, start_times);

		// update module progress bar if it has changed
		if (last_module && (current_module != last_module)) {
			update_mod_progress_bar(current_module);
			tag_current_module(current_module, start_times);
			elapsed_modules += last_module.duration * 60 * 1000;
		}
		// subtract module duration of elapsed modules
		let mod_progress = elapsed_time - elapsed_modules;
		
		// calculate the position of module progress indicator
		let mod_progress_percentage = calculate_progress(mod_progress, current_module.duration);
		move_mod_indicator(mod_progress_percentage);

		let pr_duration_ms = data.presentation.duration * 60 * 1000;
		if (elapsed_time < pr_duration_ms) window.requestAnimationFrame(step);
		
		last_module = current_module;
		
		if (pr_progress_percentage >= 100) {
			return;
		}
	};
	
	$('#start_button').click(function() {
		window.requestAnimationFrame(step);
		$('#pr_elapsed_time').css('display', 'block');
	});
});
